import jwt from 'jsonwebtoken';
import { prisma } from '../services/prisma.js';

export const protect = async (req, res, next) => {
  try {
    // Check for Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401);
      throw new Error('Not authorized, no token');
    }

    // Get token from header
    const token = authHeader.split(' ')[1];
    if (!token) {
      res.status(401);
      throw new Error('Not authorized, invalid token format');
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from token
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      });

      if (!user) {
        res.status(401);
        throw new Error('Not authorized, user not found');
      }

      req.user = user;
      next();
    } catch (error) {
      res.status(401);
      if (error.name === 'JsonWebTokenError') {
        throw new Error('Not authorized, invalid token');
      } else if (error.name === 'TokenExpiredError') {
        throw new Error('Not authorized, token expired');
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(401);
    throw new Error('Not authorized as an admin');
  }
};