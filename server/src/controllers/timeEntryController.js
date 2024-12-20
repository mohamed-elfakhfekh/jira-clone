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
            number: true,
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

    // Format time entries for response
    const formattedTimeEntries = timeEntries.map(entry => ({
      ...entry,
      timeSpent: {
        hours: Math.floor(entry.timeSpent / 60),
        minutes: entry.timeSpent % 60,
        total: entry.timeSpent
      }
    }));

    res.json(formattedTimeEntries);
  } catch (error) {
    console.error('Error fetching time entries:', error);
    res.status(500).json({ message: 'Error fetching time entries' });
  }
};

// Create a new time entry
export const createTimeEntry = async (req, res) => {
  const { taskId, description, hours = 0, minutes = 0, date } = req.body;
  const userId = req.user.id;

  try {
    // Validate time inputs
    const numHours = parseInt(hours) || 0;
    const numMinutes = parseInt(minutes) || 0;
    
    if (numHours < 0 || numMinutes < 0 || numMinutes >= 60) {
      return res.status(400).json({ 
        message: 'Invalid time format. Hours must be positive and minutes must be between 0 and 59.' 
      });
    }

    // Convert to total minutes
    const timeSpentMinutes = (numHours * 60) + numMinutes;

    if (timeSpentMinutes === 0) {
      return res.status(400).json({ 
        message: 'Time spent must be greater than 0' 
      });
    }

    // Validate that the task exists and user has access to it
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        board: {
          project: {
            OR: [
              { ownerId: userId },
              { members: { some: { userId: userId } } }
            ]
          }
        }
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
      return res.status(404).json({ message: 'Task not found or access denied' });
    }

    const timeEntry = await prisma.timeEntry.create({
      data: {
        description,
        timeSpent: timeSpentMinutes,
        date: new Date(date),
        task: {
          connect: { id: taskId }
        },
        user: {
          connect: { id: userId }
        },
        project: {
          connect: { id: task.board.project.id }
        }
      },
      include: {
        task: {
          select: {
            id: true,
            title: true,
            number: true,
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true
          }
        }
      }
    });

    // Update task's timeSpent
    const totalTimeSpent = await prisma.timeEntry.aggregate({
      where: {
        taskId: taskId
      },
      _sum: {
        timeSpent: true
      }
    });

    // Convert total minutes to hours for task update
    const totalHours = (totalTimeSpent._sum.timeSpent || 0) / 60;

    await prisma.task.update({
      where: { id: taskId },
      data: {
        timeSpent: Math.round(totalHours * 100) / 100 // Round to 2 decimal places
      }
    });

    // Format timeSpent for response
    const responseHours = Math.floor(timeSpentMinutes / 60);
    const responseMinutes = timeSpentMinutes % 60;
    timeEntry.timeSpent = {
      hours: responseHours,
      minutes: responseMinutes,
      total: timeSpentMinutes
    };

    res.status(201).json(timeEntry);
  } catch (error) {
    console.error('Error creating time entry:', error);
    res.status(400).json({ message: error.message });
  }
};

// Update a time entry
export const updateTimeEntry = async (req, res) => {
  const { id } = req.params;
  const { description, hours = 0, minutes = 0, date } = req.body;
  const userId = req.user.id;

  try {
    // Validate time inputs
    const numHours = parseInt(hours) || 0;
    const numMinutes = parseInt(minutes) || 0;
    
    if (numHours < 0 || numMinutes < 0 || numMinutes >= 60) {
      return res.status(400).json({ 
        message: 'Invalid time format. Hours must be positive and minutes must be between 0 and 59.' 
      });
    }

    // Convert to total minutes
    const timeSpentMinutes = (numHours * 60) + numMinutes;

    if (timeSpentMinutes === 0) {
      return res.status(400).json({ 
        message: 'Time spent must be greater than 0' 
      });
    }

    const timeEntry = await prisma.timeEntry.update({
      where: {
        id,
        userId, // Ensure user owns the time entry
      },
      data: {
        description,
        timeSpent: timeSpentMinutes,
        date: new Date(date),
      },
      include: {
        task: {
          select: {
            title: true,
            number: true,
          },
        },
      },
    });

    // Format timeSpent for response
    const responseHours = Math.floor(timeEntry.timeSpent / 60);
    const responseMinutes = timeEntry.timeSpent % 60;
    timeEntry.timeSpent = {
      hours: responseHours,
      minutes: responseMinutes,
      total: timeEntry.timeSpent
    };

    res.json(timeEntry);
  } catch (error) {
    console.error('Error updating time entry:', error);
    res.status(404).json({ message: 'Time entry not found or access denied' });
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
    console.error('Error deleting time entry:', error);
    res.status(404).json({ message: 'Time entry not found or access denied' });
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

    // Format time entries for response
    const formattedTimeEntries = timeEntries.map(entry => ({
      ...entry,
      timeSpent: {
        hours: Math.floor(entry._sum.timeSpent / 60),
        minutes: entry._sum.timeSpent % 60,
        total: entry._sum.timeSpent
      }
    }));

    res.json(formattedTimeEntries);
  } catch (error) {
    console.error('Error fetching time entries summary:', error);
    res.status(500).json({ message: 'Error fetching time entries summary' });
  }
};