import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  addProjectMember,
  removeProjectMember,
} from '../controllers/projectController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { body } from 'express-validator';

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getProjects)
  .post(
    [
      body('name').trim().notEmpty().withMessage('Project name is required'),
      body('key')
        .trim()
        .notEmpty()
        .withMessage('Project key is required')
        .matches(/^[A-Za-z][A-Za-z0-9]*$/)
        .withMessage('Project key must start with a letter and contain only letters and numbers')
        .isLength({ max: 10 })
        .withMessage('Project key must be 10 characters or less'),
      body('description').optional().trim(),
    ],
    validateRequest,
    createProject
  );

router
  .route('/:id')
  .get(getProjectById)
  .patch(
    [
      body('name').optional().trim().notEmpty().withMessage('Project name cannot be empty'),
      body('description').optional().trim(),
    ],
    validateRequest,
    updateProject
  );

router.post(
  '/:id/members',
  [body('userId').trim().notEmpty().withMessage('User ID is required')],
  validateRequest,
  addProjectMember
);

router.delete('/:id/members/:userId', removeProjectMember);

export default router;