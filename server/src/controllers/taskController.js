import { prisma } from '../services/prisma.js';

export const createTask = async (req, res) => {
  try {
    const { title, description, type, priority, boardId, columnId } = req.body;

    // First, verify board and column exist and user has access
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        project: {
          OR: [
            { ownerId: req.user.id },
            { members: { some: { id: req.user.id } } }
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
        type,
        priority,
        number: taskNumber,
        order,
        board: {
          connect: { id: boardId }
        },
        column: {
          connect: { id: columnId }
        },
        creator: {
          connect: { id: req.user.id }
        }
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
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('Task creation error:', error);
    res.status(400);
    throw new Error(error.message || 'Error creating task');
  }
};

export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Verify task exists and user has access
    const existingTask = await prisma.task.findFirst({
      where: {
        id,
        board: {
          project: {
            OR: [
              { ownerId: req.user.id },
              { members: { some: { id: req.user.id } } }
            ]
          }
        }
      }
    });

    if (!existingTask) {
      res.status(404);
      throw new Error('Task not found or access denied');
    }

    // If changing column, handle reordering
    if (updateData.columnId) {
      // Get current tasks in the target column
      const tasksInColumn = await prisma.task.findMany({
        where: { 
          columnId: updateData.columnId,
          id: { not: id } // Exclude the current task
        },
        orderBy: { order: 'asc' }
      });

      // Calculate new order
      const order = typeof updateData.order === 'number' 
        ? updateData.order 
        : tasksInColumn.length;

      // Reorder tasks in the column
      await prisma.$transaction(
        tasksInColumn
          .filter(task => task.order >= order)
          .map(task => 
            prisma.task.update({
              where: { id: task.id },
              data: { order: task.order + 1 }
            })
          )
      );

      updateData.order = order;
    }

    // Update the task
    const task = await prisma.task.update({
      where: { id },
      data: updateData,
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
    });

    res.json(task);
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
        board: {
          project: {
            OR: [
              { ownerId: req.user.id },
              { members: { some: { id: req.user.id } } }
            ]
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