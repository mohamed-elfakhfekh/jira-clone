import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clean up existing data
  await prisma.timeEntry.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.column.deleteMany();
  await prisma.board.deleteMany();
  await prisma.projectKPI.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating users...');
  
  // Create users with different roles
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: hashedPassword,
      name: 'Admin User',
      avatar: 'https://ui-avatars.com/api/?name=Admin+User',
      role: 'ADMIN'
    }
  });
  console.log('Created admin user:', adminUser.email);

  const john = await prisma.user.create({
    data: {
      email: 'john@example.com',
      password: hashedPassword,
      name: 'John Doe',
      avatar: 'https://ui-avatars.com/api/?name=John+Doe',
      role: 'USER'
    }
  });
  console.log('Created user:', john.email);

  const jane = await prisma.user.create({
    data: {
      email: 'jane@example.com',
      password: hashedPassword,
      name: 'Jane Smith',
      avatar: 'https://ui-avatars.com/api/?name=Jane+Smith',
      role: 'USER'
    }
  });
  console.log('Created user:', jane.email);

  const bob = await prisma.user.create({
    data: {
      email: 'bob@example.com',
      password: hashedPassword,
      name: 'Bob Wilson',
      avatar: 'https://ui-avatars.com/api/?name=Bob+Wilson',
      role: 'USER'
    }
  });
  console.log('Created user:', bob.email);

  const alice = await prisma.user.create({
    data: {
      email: 'alice@example.com',
      password: hashedPassword,
      name: 'Alice Johnson',
      avatar: 'https://ui-avatars.com/api/?name=Alice+Johnson',
      role: 'USER'
    }
  });
  console.log('Created user:', alice.email);

  console.log('Creating project...');
  // Create project
  const project = await prisma.project.create({
    data: {
      name: 'Sample Project',
      key: 'SAMPLE',
      description: 'This is a sample project for demonstration purposes',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      owner: {
        connect: { id: adminUser.id }
      },
      members: {
        create: [
          {
            assignedAt: new Date(),
            assignedBy: adminUser.id,
            userId: adminUser.id
          },
          {
            assignedAt: new Date(),
            assignedBy: adminUser.id,
            userId: john.id
          },
          {
            assignedAt: new Date(),
            assignedBy: adminUser.id,
            userId: jane.id
          }
        ]
      }
    }
  });
  console.log('Created project:', project.name);

  console.log('Creating board...');
  // Create board
  const board = await prisma.board.create({
    data: {
      name: 'Main Board',
      projectId: project.id
    }
  });
  console.log('Created board:', board.name);

  console.log('Creating columns...');
  // Create columns
  const columns = await Promise.all([
    prisma.column.create({
      data: {
        name: 'To Do',
        order: 0,
        board: {
          connect: { id: board.id }
        }
      }
    }),
    prisma.column.create({
      data: {
        name: 'In Progress',
        order: 1,
        board: {
          connect: { id: board.id }
        }
      }
    }),
    prisma.column.create({
      data: {
        name: 'In Review',
        order: 2,
        board: {
          connect: { id: board.id }
        }
      }
    }),
    prisma.column.create({
      data: {
        name: 'Testing',
        order: 3,
        board: {
          connect: { id: board.id }
        }
      }
    }),
    prisma.column.create({
      data: {
        name: 'Done',
        order: 4,
        board: {
          connect: { id: board.id }
        }
      }
    })
  ]);
  console.log('Created columns');

  console.log('Creating tasks...');
  // Create tasks with time tracking data
  const tasks = await Promise.all([
    prisma.task.create({
      data: {
        number: 'ALPHA-1',
        title: 'Set up project infrastructure',
        description: 'Initialize the development environment and set up necessary tools',
        type: 'TASK',
        priority: 'HIGH',
        order: 0,
        startedAt: new Date('2024-01-15T09:00:00Z'),
        completedAt: new Date('2024-01-15T17:00:00Z'),
        project: {
          connect: { id: project.id }
        },
        board: {
          connect: { id: board.id }
        },
        column: {
          connect: { id: columns[4].id }
        },
        assignee: {
          connect: { id: john.id }
        },
        creator: {
          connect: { id: adminUser.id }
        }
      }
    }),
    prisma.task.create({
      data: {
        number: 'ALPHA-2',
        title: 'Design database schema',
        description: 'Create the initial database schema for the project',
        type: 'STORY',
        priority: 'HIGH',
        order: 0,
        startedAt: new Date('2024-01-16T10:00:00Z'),
        project: {
          connect: { id: project.id }
        },
        board: {
          connect: { id: board.id }
        },
        column: {
          connect: { id: columns[1].id }
        },
        assignee: {
          connect: { id: jane.id }
        },
        creator: {
          connect: { id: adminUser.id }
        }
      }
    }),
    prisma.task.create({
      data: {
        number: 'ALPHA-3',
        title: 'Implement user authentication',
        description: 'Add user registration and login functionality',
        type: 'STORY',
        priority: 'MEDIUM',
        order: 0,
        startedAt: new Date('2024-01-17T09:00:00Z'),
        completedAt: new Date('2024-01-18T15:00:00Z'),
        project: {
          connect: { id: project.id }
        },
        board: {
          connect: { id: board.id }
        },
        column: {
          connect: { id: columns[2].id }
        },
        assignee: {
          connect: { id: bob.id }
        },
        creator: {
          connect: { id: adminUser.id }
        }
      }
    }),
    prisma.task.create({
      data: {
        number: 'ALPHA-4',
        title: 'Implement API endpoints',
        description: 'Create RESTful API endpoints for core functionality',
        type: 'TASK',
        priority: 'HIGH',
        order: 1,
        startedAt: new Date('2024-01-18T09:00:00Z'),
        project: {
          connect: { id: project.id }
        },
        board: {
          connect: { id: board.id }
        },
        column: {
          connect: { id: columns[3].id }
        },
        assignee: {
          connect: { id: alice.id }
        },
        creator: {
          connect: { id: john.id }
        }
      }
    }),
    prisma.task.create({
      data: {
        number: 'ALPHA-5',
        title: 'Setup CI/CD pipeline',
        description: 'Configure continuous integration and deployment workflow',
        type: 'TASK',
        priority: 'MEDIUM',
        order: 1,
        project: {
          connect: { id: project.id }
        },
        board: {
          connect: { id: board.id }
        },
        column: {
          connect: { id: columns[0].id }
        },
        assignee: {
          connect: { id: john.id }
        },
        creator: {
          connect: { id: jane.id }
        }
      }
    })
  ]);
  console.log('Created tasks');

  console.log('Creating time entries...');
  // Add time entries for tasks
  await Promise.all([
    prisma.timeEntry.create({
      data: {
        description: 'Initial setup and configuration',
        timeSpent: 240, // 4 hours in minutes
        date: new Date('2024-01-15T10:00:00Z'),
        task: { connect: { id: tasks[0].id } },
        user: { connect: { id: john.id } },
        project: { connect: { id: project.id } }
      }
    }),
    prisma.timeEntry.create({
      data: {
        description: 'Environment setup and documentation',
        timeSpent: 240, // 4 hours in minutes
        date: new Date('2024-01-15T14:00:00Z'),
        task: { connect: { id: tasks[0].id } },
        user: { connect: { id: john.id } },
        project: { connect: { id: project.id } }
      }
    }),
    prisma.timeEntry.create({
      data: {
        description: 'Database schema design - Day 1',
        timeSpent: 360, // 6 hours in minutes
        date: new Date('2024-01-16T11:00:00Z'),
        task: { connect: { id: tasks[1].id } },
        user: { connect: { id: jane.id } },
        project: { connect: { id: project.id } }
      }
    })
  ]);
  console.log('Created time entries');

  console.log('Creating comments...');
  // Add comments to tasks
  await Promise.all([
    prisma.comment.create({
      data: {
        content: 'Infrastructure setup completed successfully',
        task: { connect: { id: tasks[0].id } },
        user: { connect: { id: john.id } }
      }
    }),
    prisma.comment.create({
      data: {
        content: 'All tests are passing now',
        task: { connect: { id: tasks[0].id } },
        user: { connect: { id: jane.id } }
      }
    }),
    prisma.comment.create({
      data: {
        content: 'Schema design in progress, need input on relationships',
        task: { connect: { id: tasks[1].id } },
        user: { connect: { id: jane.id } }
      }
    })
  ]);
  console.log('Created comments');

  console.log('Creating KPIs...');
  // Add KPIs
  await Promise.all([
    prisma.projectKPI.create({
      data: {
        name: 'Sprint Velocity',
        target: 20,
        current: 15,
        unit: 'story points',
        type: 'VELOCITY',
        description: 'Average number of story points completed per sprint',
        startDate: new Date('2024-01-15T00:00:00Z'),
        endDate: new Date('2024-02-15T00:00:00Z'),
        project: { connect: { id: project.id } }
      }
    }),
    prisma.projectKPI.create({
      data: {
        name: 'Cycle Time',
        target: 5,
        current: 3.5,
        unit: 'days',
        type: 'CYCLE_TIME',
        description: 'Average time from start to completion of tasks',
        startDate: new Date('2024-01-15T00:00:00Z'),
        endDate: new Date('2024-02-15T00:00:00Z'),
        project: { connect: { id: project.id } }
      }
    }),
    prisma.projectKPI.create({
      data: {
        name: 'Completion Rate',
        target: 90,
        current: 85,
        unit: 'percentage',
        type: 'COMPLETION_RATE',
        description: 'Percentage of tasks completed within estimated time',
        startDate: new Date('2024-01-15T00:00:00Z'),
        endDate: new Date('2024-02-15T00:00:00Z'),
        project: { connect: { id: project.id } }
      }
    })
  ]);
  console.log('Created KPIs');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
