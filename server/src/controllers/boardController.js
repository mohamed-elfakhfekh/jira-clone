import { prisma } from '../services/prisma.js';

export const getBoardByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;
    console.log('Fetching board for project:', projectId);

    // First check if project exists and user has access
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: req.user.id },
          { members: { some: { id: req.user.id } } }
        ]
      }
    });

    console.log('Found project:', project);

    if (!project) {
      res.status(404);
      throw new Error('Project not found or access denied');
    }

    const board = await prisma.board.findFirst({
      where: {
        projectId,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            key: true,
          }
        },
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
                    email: true
                  }
                }
              }
            }
          }
        }
      }
    });

    console.log('Found board:', board);

    if (!board) {
      // If no board exists, create one automatically
      const newBoard = await prisma.board.create({
        data: {
          name: 'Default Board',
          projectId: project.id,
          columns: {
            create: [
              { name: 'To Do', order: 0 },
              { name: 'In Progress', order: 1 },
              { name: 'Done', order: 2 }
            ]
          }
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              key: true,
            }
          },
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
                      email: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      console.log('Created new board:', newBoard);
      return res.json(newBoard);
    }

    res.json(board);
  } catch (error) {
    console.error('Error fetching board:', error);
    res.status(error.statusCode || 500);
    throw new Error(error.message || 'Error fetching board');
  }
};

export const createBoard = async (req, res) => {
  try {
    const { name, projectId } = req.body;

    // Verify user has access to the project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { ownerId: req.user.id },
          { members: { some: { id: req.user.id } } }
        ]
      }
    });

    if (!project) {
      res.status(404);
      throw new Error('Project not found or access denied');
    }

    const board = await prisma.board.create({
      data: {
        name,
        project: {
          connect: { id: projectId }
        },
        columns: {
          create: [
            { name: 'To Do', order: 0 },
            { name: 'In Progress', order: 1 },
            { name: 'Done', order: 2 }
          ]
        }
      },
      include: {
        columns: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    res.status(201).json(board);
  } catch (error) {
    console.error('Error creating board:', error);
    res.status(400);
    throw new Error(error.message || 'Error creating board');
  }
};

export const updateBoard = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const board = await prisma.board.update({
      where: {
        id,
        project: {
          OR: [
            { ownerId: req.user.id },
            { members: { some: { id: req.user.id } } }
          ]
        }
      },
      data: {
        name
      },
      include: {
        columns: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    res.json(board);
  } catch (error) {
    console.error('Error updating board:', error);
    res.status(400);
    throw new Error(error.message || 'Error updating board');
  }
};

export const updateColumnOrder = async (req, res) => {
  try {
    const { boardId } = req.params;
    const { columns } = req.body;

    // Verify board exists and user has access
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        project: {
          OR: [
            { ownerId: req.user.id },
            { members: { some: { id: req.user.id } } }
          ]
        }
      }
    });

    if (!board) {
      res.status(404);
      throw new Error('Board not found or access denied');
    }

    // Update column orders
    await Promise.all(
      columns.map((col, index) =>
        prisma.column.update({
          where: { id: col.id },
          data: { order: index }
        })
      )
    );

    const updatedBoard = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        columns: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    res.json(updatedBoard);
  } catch (error) {
    console.error('Error updating column order:', error);
    res.status(400);
    throw new Error(error.message || 'Error updating column order');
  }
};