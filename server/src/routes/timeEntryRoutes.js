import express from 'express';
import {
  getMyTimeEntries,
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  getProjectTimeEntriesSummary,
} from '../controllers/timeEntryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getMyTimeEntries)
  .post(createTimeEntry);

router.route('/:id')
  .put(updateTimeEntry)
  .delete(deleteTimeEntry);

router.get('/projects/:projectId/summary', getProjectTimeEntriesSummary);

export default router;