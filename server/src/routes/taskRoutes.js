import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  createTask,
  updateTask,
  getAssignedTasks,
  deleteTask,
} from '../controllers/taskController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { body } from 'express-validator';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .post(
    [
      body('title').trim().notEmpty().withMessage('Title is required'),
      body('type').isIn(['TASK', 'BUG', 'STORY', 'EPIC']).withMessage('Invalid task type'),
      body('priority').isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).withMessage('Invalid priority'),
      body('boardId').notEmpty().withMessage('Board ID is required'),
      body('columnId').notEmpty().withMessage('Column ID is required'),
    ],
    validateRequest,
    createTask
  );

router.get('/assigned', getAssignedTasks);

router
  .route('/:id')
  .patch(updateTask)
  .delete(deleteTask);

export default router;