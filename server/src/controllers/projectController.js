import { prisma } from '../services/prisma.js';

export const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { members: { some: { id: req.user.id } } }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    res.json(projects);
  } catch (error) {
    res.status(500);
    throw new Error('Error fetching projects');
  }
};

export const getProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { ownerId: req.user.id },
          { members: { some: { id: req.user.id } } }
        ]
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        boards: {
          include: {
            columns: {
              orderBy: {
                order: 'asc'
              }
            }
          }
        }
      }
    });

    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }

    res.json(project);
  } catch (error) {
    res.status(404);
    throw new Error('Project not found');
  }
};

export const createProject = async (req, res) => {
  const { name, key, description } = req.body;

  try {
    // Check if project key already exists
    const existingProject = await prisma.project.findUnique({
      where: { key }
    });

    if (existingProject) {
      res.status(400);
      throw new Error('Project key already exists');
    }

    const project = await prisma.project.create({
      data: {
        name,
        key,
        description,
        ownerId: req.user.id,
        members: {
          connect: { id: req.user.id }
        },
        boards: {
          create: {
            name: 'Default Board',
            columns: {
              createMany: {
                data: [
                  { name: 'To Do', order: 0 },
                  { name: 'In Progress', order: 1 },
                  { name: 'Done', order: 2 }
                ]
              }
            }
          }
        }
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        boards: {
          include: {
            columns: true
          }
        }
      }
    });

    res.status(201).json(project);
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(400);
      throw new Error('Project key already exists');
    }
    res.status(400);
    throw new Error('Error creating project');
  }
};

export const updateProject = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;

  try {
    const project = await prisma.project.update({
      where: {
        id,
        ownerId: req.user.id // Only owner can update project
      },
      data: {
        name,
        description
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        members: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(project);
  } catch (error) {
    res.status(404);
    throw new Error('Project not found or unauthorized');
  }
};

export const addProjectMember = async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  try {
    const project = await prisma.project.update({
      where: {
        id,
        ownerId: req.user.id // Only owner can add members
      },
      data: {
        members: {
          connect: { id: userId }
        }
      },
      include: {
        members: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    res.json(project);
  } catch (error) {
    res.status(400);
    throw new Error('Error adding member to project');
  }
};

export const removeProjectMember = async (req, res) => {
  const { id, userId } = req.params;

  try {
    // Cannot remove owner
    const project = await prisma.project.findUnique({
      where: { id },
      select: { ownerId: true }
    });

    if (project.ownerId === userId) {
      res.status(400);
      throw new Error('Cannot remove project owner');
    }

    const updatedProject = await prisma.project.update({
      where: {
        id,
        ownerId: req.user.id // Only owner can remove members
      },
      data: {
        members: {
          disconnect: { id: userId }
        }
      }
    });

    res.json(updatedProject);
  } catch (error) {
    res.status(400);
    throw new Error('Error removing member from project');
  }
};