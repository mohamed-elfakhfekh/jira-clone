import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { prisma } from '../services/prisma.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

// Test route
router.get('/test', async (req, res) => {
  const users = await prisma.user.findMany();
  console.log('All users:', users);
  res.json(users);
});

export default router;