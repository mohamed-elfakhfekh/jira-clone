import { prisma } from '../services/prisma.js';

// Get all KPIs for a project
export const getProjectKPIs = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project access
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

    const kpis = await prisma.projectKPI.findMany({
      where: {
        projectId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(kpis);
  } catch (error) {
    console.error('Error fetching KPIs:', error);
    res.status(400);
    throw new Error(error.message);
  }
};

// Create a new KPI
export const createKPI = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { name, target, unit, type, description, startDate, endDate } = req.body;

    // Verify project access
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

    const kpi = await prisma.projectKPI.create({
      data: {
        name,
        target,
        unit,
        type,
        description,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        project: {
          connect: { id: projectId }
        }
      }
    });

    res.status(201).json(kpi);
  } catch (error) {
    console.error('Error creating KPI:', error);
    res.status(400);
    throw new Error(error.message);
  }
};

// Update KPI
export const updateKPI = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, target, current, unit, type, description, startDate, endDate } = req.body;

    // Verify KPI exists and user has access
    const existingKPI = await prisma.projectKPI.findFirst({
      where: {
        id,
        project: {
          OR: [
            { ownerId: req.user.id },
            { members: { some: { id: req.user.id } } }
          ]
        }
      }
    });

    if (!existingKPI) {
      res.status(404);
      throw new Error('KPI not found or access denied');
    }

    const updatedKPI = await prisma.projectKPI.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(target !== undefined && { target }),
        ...(current !== undefined && { current }),
        ...(unit !== undefined && { unit }),
        ...(type !== undefined && { type }),
        ...(description !== undefined && { description }),
        ...(startDate !== undefined && { startDate: new Date(startDate) }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null })
      }
    });

    res.json(updatedKPI);
  } catch (error) {
    console.error('Error updating KPI:', error);
    res.status(400);
    throw new Error(error.message);
  }
};

// Delete KPI
export const deleteKPI = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify KPI exists and user has access
    const existingKPI = await prisma.projectKPI.findFirst({
      where: {
        id,
        project: {
          OR: [
            { ownerId: req.user.id },
            { members: { some: { id: req.user.id } } }
          ]
        }
      }
    });

    if (!existingKPI) {
      res.status(404);
      throw new Error('KPI not found or access denied');
    }

    await prisma.projectKPI.delete({
      where: { id }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting KPI:', error);
    res.status(400);
    throw new Error(error.message);
  }
};

// Calculate and update KPI values
export const calculateKPIs = async (projectId) => {
  const [cycleTime, velocity, completionRate, estimationAccuracy] = await Promise.all([
    calculateCycleTime(projectId),
    calculateVelocity(projectId),
    calculateCompletionRate(projectId),
    calculateTimeEstimationAccuracy(projectId)
  ]);

  // Define default targets
  const defaultTargets = {
    CYCLE_TIME: { target: 5, unit: 'days' },
    VELOCITY: { target: 10, unit: 'tasks' },
    COMPLETION_RATE: { target: 90, unit: '%' },
    ESTIMATION_ACCURACY: { target: 85, unit: '%' }
  };

  // Prepare KPI data
  const kpiData = [
    {
      type: 'CYCLE_TIME',
      name: 'Cycle Time',
      current: cycleTime,
      description: 'Average time from start to completion'
    },
    {
      type: 'VELOCITY',
      name: 'Sprint Velocity',
      current: velocity,
      description: 'Number of tasks completed in last 2 weeks'
    },
    {
      type: 'COMPLETION_RATE',
      name: 'Completion Rate',
      current: completionRate,
      description: 'Percentage of completed tasks'
    },
    {
      type: 'ESTIMATION_ACCURACY',
      name: 'Estimation Accuracy',
      current: estimationAccuracy,
      description: 'Accuracy of time estimates'
    }
  ];

  // Update or create KPIs in a transaction
  await prisma.$transaction(
    kpiData.map(kpi => 
      prisma.projectKPI.upsert({
        where: {
          projectId_type: {
            projectId,
            type: kpi.type
          }
        },
        update: { 
          current: kpi.current 
        },
        create: {
          projectId,
          name: kpi.name,
          type: kpi.type,
          current: kpi.current,
          target: defaultTargets[kpi.type].target,
          unit: defaultTargets[kpi.type].unit,
          description: kpi.description
        }
      })
    )
  );

  return await prisma.projectKPI.findMany({
    where: { projectId }
  });
};

// Helper functions for KPI calculations
async function calculateCycleTime(projectId) {
  const tasks = await prisma.task.findMany({
    where: {
      board: {
        projectId
      },
      completedAt: {
        not: null
      },
      startedAt: {
        not: null
      }
    },
    select: {
      startedAt: true,
      completedAt: true
    }
  });

  if (tasks.length === 0) return 0;

  const cycleTimes = tasks.map(task => {
    const startDate = new Date(task.startedAt);
    const endDate = new Date(task.completedAt);
    return (endDate - startDate) / (1000 * 60 * 60 * 24); // Convert to days
  });

  return Number((cycleTimes.reduce((acc, time) => acc + time, 0) / cycleTimes.length).toFixed(1));
}

async function calculateVelocity(projectId) {
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

  return await prisma.task.count({
    where: {
      board: {
        projectId
      },
      completedAt: {
        gte: twoWeeksAgo
      }
    }
  });
}

async function calculateCompletionRate(projectId) {
  const [totalTasks, completedTasks] = await Promise.all([
    prisma.task.count({
      where: {
        board: {
          projectId
        }
      }
    }),
    prisma.task.count({
      where: {
        board: {
          projectId
        },
        completedAt: {
          not: null
        }
      }
    })
  ]);

  if (totalTasks === 0) return 0;
  return Number(((completedTasks / totalTasks) * 100).toFixed(1));
}

async function calculateTimeEstimationAccuracy(projectId) {
  const tasks = await prisma.task.findMany({
    where: {
      board: {
        projectId
      },
      completedAt: {
        not: null
      },
      estimatedTime: {
        not: null
      },
      timeSpent: {
        not: null
      }
    },
    select: {
      estimatedTime: true,
      timeSpent: true
    }
  });

  if (tasks.length === 0) return 100;

  const accuracies = tasks.map(task => {
    const accuracy = 100 - Math.abs((task.timeSpent - task.estimatedTime) / task.estimatedTime * 100);
    return Math.max(0, accuracy); // Cap at 0% accuracy
  });

  return Number((accuracies.reduce((acc, accuracy) => acc + accuracy, 0) / accuracies.length).toFixed(1));
}
