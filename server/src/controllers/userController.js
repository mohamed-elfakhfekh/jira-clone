import { prisma } from '../services/prisma.js';

export const getUserProjects = async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      where: {
        OR: [
          { ownerId: req.user.id },
          { members: { some: { id: req.user.id } } }
        ]
      },
      orderBy: {
        updatedAt: 'desc'
      }
    });

    res.json(projects);
  } catch (error) {
    console.error('Error fetching user projects:', error);
    res.status(500).json({ message: 'Failed to fetch user projects' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        role: true
      }
    });
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500);
    throw new Error('Error fetching users');
  }
};
