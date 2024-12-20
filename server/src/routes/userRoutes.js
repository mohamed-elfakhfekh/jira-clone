import express from 'express';
import { getUserProjects, getUsers } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/projects', protect, getUserProjects);
router.get('/', protect, getUsers);

export default router;
