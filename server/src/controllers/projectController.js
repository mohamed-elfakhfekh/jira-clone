import { prisma } from '../services/prisma.js';

export const getProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } }
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
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    const transformedProjects = projects.map(project => ({
      ...project,
      members: project.members.map(member => member.user)
    }));

    res.json(transformedProjects);
  } catch (error) {
    console.error('Error fetching projects:', error);
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
          { members: { some: { userId: req.user.id } } }
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
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        board: {
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

    const transformedProject = {
      ...project,
      members: project.members.map(member => member.user)
    };

    res.json(transformedProject);
  } catch (error) {
    console.error('Error fetching project:', error);
    res.status(404);
    throw new Error('Project not found');
  }
};

export const createProject = async (req, res) => {
  try {
    const { name, key, description, startDate, endDate } = req.body;

    if (!name || !key) {
      res.status(400);
      throw new Error('Name and key are required');
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      res.status(400);
      throw new Error('End date must be after start date');
    }

    const existingProject = await prisma.project.findUnique({
      where: { key },
    });

    if (existingProject) {
      res.status(400);
      throw new Error('Project key already exists');
    }

    const project = await prisma.project.create({
      data: {
        name,
        key: key.toUpperCase(),
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        owner: {
          connect: { id: req.user.id }
        },
        members: {
          create: [
            {
              assignedAt: new Date(),
              assignedBy: req.user.id,
              userId: req.user.id
            }
          ]
        },
        board: {
          create: {
            name: 'Main Board',
            columns: {
              createMany: {
                data: [
                  { name: 'To Do', order: 0 },
                  { name: 'In Progress', order: 1 },
                  { name: 'In Review', order: 2 },
                  { name: 'Testing', order: 3 },
                  { name: 'Done', order: 4 }
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
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        board: {
          include: {
            columns: true
          }
        }
      }
    });

    const transformedProject = {
      ...project,
      members: project.members.map(member => member.user)
    };

    res.status(201).json(transformedProject);
  } catch (error) {
    console.error('Error creating project:', error);
    if (error.code === 'P2002') {
      res.status(400);
      throw new Error('Project key already exists');
    }
    res.status(400);
    throw new Error('Error creating project');
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, startDate, endDate } = req.body;

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      res.status(400);
      throw new Error('End date must be after start date');
    }

    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      }
    });

    if (!project) {
      res.status(404);
      throw new Error('Project not found or access denied');
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined
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
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        board: {
          include: {
            columns: true
          }
        }
      }
    });

    const transformedProject = {
      ...updatedProject,
      members: updatedProject.members.map(member => member.user)
    };

    res.json(transformedProject);
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
        ownerId: req.user.id
      },
      data: {
        members: {
          connect: { id: userId }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    const transformedProject = {
      ...project,
      members: project.members.map(member => member.user)
    };

    res.json(transformedProject);
  } catch (error) {
    res.status(400);
    throw new Error('Error adding member to project');
  }
};

export const removeProjectMember = async (req, res) => {
  const { id, userId } = req.params;

  try {
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
        ownerId: req.user.id
      },
      data: {
        members: {
          disconnect: { id: userId }
        }
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    const transformedProject = {
      ...updatedProject,
      members: updatedProject.members.map(member => member.user)
    };

    res.json(transformedProject);
  } catch (error) {
    res.status(400);
    throw new Error('Error removing member from project');
  }
};

export const getProjectBoard = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await prisma.project.findFirst({
      where: {
        id,
        OR: [
          { ownerId: req.user.id },
          { members: { some: { userId: req.user.id } } }
        ]
      },
      include: {
        board: true
      }
    });

    if (!project) {
      res.status(404);
      throw new Error('Project not found or access denied');
    }

    if (!project.board) {
      // Create a default board if none exists
      const board = await prisma.board.create({
        data: {
          name: 'Main Board',
          project: {
            connect: { id: project.id }
          },
          columns: {
            createMany: {
              data: [
                { name: 'To Do', order: 0 },
                { name: 'In Progress', order: 1 },
                { name: 'In Review', order: 2 },
                { name: 'Testing', order: 3 },
                { name: 'Done', order: 4 }
              ]
            }
          }
        },
        include: {
          columns: {
            orderBy: {
              order: 'asc'
            },
            include: {
              tasks: {
                orderBy: {
                  order: 'asc'
                },
                include: {
                  assignee: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      avatar: true
                    }
                  },
                  creator: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      avatar: true
                    }
                  },
                  designer: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      avatar: true
                    }
                  },
                  tester: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      avatar: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      return res.json(board);
    }

    // Get the existing board with all its data
    const board = await prisma.board.findFirst({
      where: {
        projectId: id
      },
      include: {
        columns: {
          orderBy: {
            order: 'asc'
          },
          include: {
            tasks: {
              orderBy: {
                order: 'asc'
              },
              include: {
                assignee: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true
                  }
                },
                creator: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true
                  }
                },
                designer: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true
                  }
                },
                tester: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true
                  }
                }
              }
            }
          }
        }
      }
    });

    res.json(board);
  } catch (error) {
    console.error('Error fetching project board:', error);
    res.status(500);
    throw new Error('Error fetching project board');
  }
};

export const getProjectKPIs = async (req, res) => {
  const { id } = req.params;

  try {
    const kpis = await prisma.projectKPI.findMany({
      where: {
        project: {
          id,
          OR: [
            { ownerId: req.user.id },
            { members: { some: { userId: req.user.id } } }
          ]
        }
      },
      select: {
        id: true,
        name: true,
        current: true,
        target: true,
        unit: true,
        type: true,
        description: true
      }
    });

    if (!kpis) {
      res.status(404);
      throw new Error('KPIs not found');
    }

    res.json(kpis);
  } catch (error) {
    res.status(404);
    throw new Error('Project KPIs not found');
  }
};