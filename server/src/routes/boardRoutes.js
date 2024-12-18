import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { body } from 'express-validator';
import {
  getBoardByProjectId,
  createBoard,
  updateBoard,
  updateColumnOrder,
} from '../controllers/boardController.js';

const router = express.Router();

router.use(protect);

// Get board by project ID
router.get('/project/:projectId', getBoardByProjectId);

// Create new board
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Board name is required'),
    body('projectId').notEmpty().withMessage('Project ID is required'),
  ],
  validateRequest,
  createBoard
);

// Update board
router.patch(
  '/:id',
  [body('name').trim().notEmpty().withMessage('Board name is required')],
  validateRequest,
  updateBoard
);

// Update column order
router.patch(
  '/:boardId/columns/order',
  [
    body('columns')
      .isArray()
      .withMessage('Columns must be an array')
      .notEmpty()
      .withMessage('Columns cannot be empty'),
  ],
  validateRequest,
  updateColumnOrder
);

export default router;