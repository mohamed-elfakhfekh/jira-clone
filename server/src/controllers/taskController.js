import { prisma } from '../services/prisma.js';

export const createTask = async (req, res) => {
  try {
    const { title, description, type, priority, boardId, columnId, assigneeId, projectId } = req.body;

    // First, verify board and column exist and user has access
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        project: {
          OR: [
            { ownerId: req.user.id },
            { members: { some: { userId: req.user.id } } }
          ]
        }
      },
      include: {
        project: true,
        columns: {
          where: {
            id: columnId
          }
        }
      }
    });

    if (!board) {
      res.status(404);
      throw new Error('Board not found or access denied');
    }

    if (board.columns.length === 0) {
      res.status(404);
      throw new Error('Column not found');
    }

    // Get the current task count for this project
    const taskCount = await prisma.task.count({
      where: {
        board: {
          project: {
            id: board.project.id
          }
        }
      }
    });

    // Generate task number (e.g., PROJ-123)
    const taskNumber = `${board.project.key}-${taskCount + 1}`;

    // Get the highest order in the target column
    const lastTask = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { order: 'desc' },
      select: { order: true }
    });

    const order = (lastTask?.order ?? -1) + 1;

    // Create the task
    const task = await prisma.task.create({
      data: {
        title,
        description,
        type: type?.toUpperCase(),
        priority: priority?.toUpperCase(),
        number: taskNumber,
        order,
        board: {
          connect: { id: boardId }
        },
        project: {
          connect: { id: projectId }
        },
        column: {
          connect: { id: columnId }
        },
        creator: {
          connect: { id: req.user.id }
        },
        ...(assigneeId && {
          assignee: {
            connect: { id: assigneeId }
          }
        })
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
        }
      }
    });

    res.status(201).json(task);
  } catch (error) {
    if (!res.statusCode || res.statusCode === 200) {
      res.status(400);
    }
    throw error;
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      priority,
      columnId,
      estimatedTime,
      assigneeId,
      designerId,
      testerId,
      order
    } = req.body;

    // Verify task exists and user has access
    const task = await prisma.task.findFirst({
      where: {
        id,
        board: {
          project: {
            OR: [
              { ownerId: req.user.id },
              { members: { some: { userId: req.user.id } } }
            ]
          }
        }
      },
      include: {
        timeEntries: true
      }
    });

    if (!task) {
      res.status(404);
      throw new Error('Task not found or access denied');
    }

    // Calculate total time spent from time entries in hours
    const totalHours = task.timeEntries.reduce((total, entry) => total + entry.timeSpent / 60, 0);

    // Prepare update data with proper enum values
    const updateData = {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(priority !== undefined && { priority: priority.toUpperCase() }),
      ...(columnId !== undefined && { columnId }),
      ...(estimatedTime !== undefined && { estimatedTime: Number(estimatedTime) }),
      timeSpent: Math.round(totalHours * 100) / 100, // Round to 2 decimal places
      ...(order !== undefined && { order }),
      ...(assigneeId !== undefined && {
        assignee: assigneeId ? { connect: { id: assigneeId } } : { disconnect: true }
      }),
      ...(designerId !== undefined && {
        designer: designerId ? { connect: { id: designerId } } : { disconnect: true }
      }),
      ...(testerId !== undefined && {
        tester: testerId ? { connect: { id: testerId } } : { disconnect: true }
      })
    };

    // Update the task
    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        timeEntries: true,
        assignee: {
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
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    res.json(updatedTask);
  } catch (error) {
    console.error('Task update error:', error);
    res.status(400);
    throw new Error(error.message || 'Error updating task');
  }
};

export const getAssignedTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        assigneeId: req.user.id
      },
      include: {
        board: {
          select: {
            project: {
              select: {
                id: true,
                name: true,
                key: true
              }
            }
          }
        },
        column: true
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Get assigned tasks error:', error);
    res.status(500);
    throw new Error('Error fetching assigned tasks');
  }
};

export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify task exists and user has access
    const task = await prisma.task.findFirst({
      where: {
        id,
        OR: [
          {
            board: {
              project: {
                ownerId: req.user.id
              }
            }
          },
          {
            board: {
              project: {
                members: {
                  some: {
                    id: req.user.id
                  }
                }
              }
            }
          }
        ]
      },
      include: {
        board: {
          include: {
            project: true
          }
        }
      }
    });

    if (!task) {
      res.status(404);
      throw new Error('Task not found or access denied');
    }

    await prisma.task.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Task deletion error:', error);
    res.status(404);
    throw new Error(error.message || 'Error deleting task');
  }
};