import { prisma } from '../services/prisma.js';

// Get time entries for a user
export const getMyTimeEntries = async (req, res) => {
  const { startDate, endDate } = req.query;
  const userId = req.user.id;

  try {
    const timeEntries = await prisma.timeEntry.findMany({
      where: {
        userId,
        date: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            key: true,
            board: {
              select: {
                project: {
                  select: {
                    id: true,
                    name: true,
                    key: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    res.json(timeEntries);
  } catch (error) {
    res.status(500);
    throw new Error('Error fetching time entries');
  }
};

// Create a new time entry
export const createTimeEntry = async (req, res) => {
  const { taskId, description, timeSpent, date } = req.body;
  const userId = req.user.id;

  try {
    // Validate that the task exists and user has access to it
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        board: {
          project: {
            members: {
              some: {
                id: userId,
              },
            },
          },
        },
      },
    });

    if (!task) {
      res.status(404);
      throw new Error('Task not found or access denied');
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        taskId,
        userId,
        description,
        timeSpent: parseInt(timeSpent),
        date: new Date(date),
      },
      include: {
        task: {
          select: {
            title: true,
            key: true,
          },
        },
      },
    });

    res.status(201).json(timeEntry);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
};

// Update a time entry
export const updateTimeEntry = async (req, res) => {
  const { id } = req.params;
  const { description, timeSpent, date } = req.body;
  const userId = req.user.id;

  try {
    const timeEntry = await prisma.timeEntry.update({
      where: {
        id,
        userId, // Ensure user owns the time entry
      },
      data: {
        description,
        timeSpent: parseInt(timeSpent),
        date: new Date(date),
      },
      include: {
        task: {
          select: {
            title: true,
            key: true,
          },
        },
      },
    });

    res.json(timeEntry);
  } catch (error) {
    res.status(404);
    throw new Error('Time entry not found or access denied');
  }
};

// Delete a time entry
export const deleteTimeEntry = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    await prisma.timeEntry.delete({
      where: {
        id,
        userId, // Ensure user owns the time entry
      },
    });

    res.status(204).send();
  } catch (error) {
    res.status(404);
    throw new Error('Time entry not found or access denied');
  }
};

// Get time entries summary for a project
export const getProjectTimeEntriesSummary = async (req, res) => {
  const { projectId } = req.params;
  const { startDate, endDate } = req.query;

  try {
    const timeEntries = await prisma.timeEntry.groupBy({
      by: ['userId'],
      where: {
        task: {
          board: {
            projectId,
          },
        },
        date: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
      },
      _sum: {
        timeSpent: true,
      },
    });

    res.json(timeEntries);
  } catch (error) {
    res.status(500);
    throw new Error('Error fetching time entries summary');
  }
};