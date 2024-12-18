import bcrypt from 'bcryptjs';
import { prisma } from './prisma.js';

export async function seedDemoData() {
  try {
    console.log('Starting to seed demo data...');

    // Clean up existing data
    await prisma.timeEntry.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.task.deleteMany();
    await prisma.column.deleteMany();
    await prisma.board.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    console.log('Cleaned up existing data');

    // Create demo user
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const demoUser = await prisma.user.create({
      data: {
        email: 'demo@example.com',
        password: hashedPassword,
        name: 'Demo User'
      }
    });

    console.log('Created demo user:', demoUser.id);

    // Create demo project
    const project = await prisma.project.create({
      data: {
        name: 'Demo Project',
        key: 'DEMO',
        description: 'A sample project to demonstrate features',
        owner: {
          connect: { id: demoUser.id }
        },
        members: {
          connect: [{ id: demoUser.id }]
        }
      }
    });

    console.log('Created demo project:', project.id);

    // Create board
    const board = await prisma.board.create({
      data: {
        name: 'Main Board',
        project: {
          connect: { id: project.id }
        }
      }
    });

    console.log('Created board:', board.id);

    // Create columns
    const todoColumn = await prisma.column.create({
      data: {
        name: 'To Do',
        order: 0,
        board: {
          connect: { id: board.id }
        }
      }
    });

    const inProgressColumn = await prisma.column.create({
      data: {
        name: 'In Progress',
        order: 1,
        board: {
          connect: { id: board.id }
        }
      }
    });

    const doneColumn = await prisma.column.create({
      data: {
        name: 'Done',
        order: 2,
        board: {
          connect: { id: board.id }
        }
      }
    });

    console.log('Created columns');

    // Create tasks
    await prisma.task.create({
      data: {
        title: 'Implement user authentication',
        description: 'Add login and registration functionality',
        type: 'TASK',
        priority: 'HIGH',
        number: 'DEMO-1',
        order: 0,
        board: {
          connect: { id: board.id }
        },
        column: {
          connect: { id: todoColumn.id }
        },
        creator: {
          connect: { id: demoUser.id }
        }
      }
    });

    await prisma.task.create({
      data: {
        title: 'Design dashboard layout',
        description: 'Create wireframes for the main dashboard',
        type: 'STORY',
        priority: 'MEDIUM',
        number: 'DEMO-2',
        order: 1,
        board: {
          connect: { id: board.id }
        },
        column: {
          connect: { id: todoColumn.id }
        },
        creator: {
          connect: { id: demoUser.id }
        }
      }
    });

    await prisma.task.create({
      data: {
        title: 'Fix navigation bug',
        description: 'Menu items not highlighting correctly',
        type: 'BUG',
        priority: 'HIGH',
        number: 'DEMO-3',
        order: 0,
        board: {
          connect: { id: board.id }
        },
        column: {
          connect: { id: inProgressColumn.id }
        },
        creator: {
          connect: { id: demoUser.id }
        },
        assignee: {
          connect: { id: demoUser.id }
        }
      }
    });

    await prisma.task.create({
      data: {
        title: 'Project setup',
        description: 'Initial repository setup and configuration',
        type: 'TASK',
        priority: 'LOW',
        number: 'DEMO-4',
        order: 0,
        board: {
          connect: { id: board.id }
        },
        column: {
          connect: { id: doneColumn.id }
        },
        creator: {
          connect: { id: demoUser.id }
        },
        assignee: {
          connect: { id: demoUser.id }
        }
      }
    });

    console.log('Created tasks');
    console.log('Demo data seeded successfully');
    
  } catch (error) {
    console.error('Error seeding demo data:', error);
    // Log the full error for debugging
    console.error(error);
  }
}