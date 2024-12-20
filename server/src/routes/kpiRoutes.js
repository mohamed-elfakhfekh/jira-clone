import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getProjectKPIs,
  createKPI,
  updateKPI,
  deleteKPI
} from '../controllers/kpiController.js';

const router = express.Router();

router.use(protect);

// Project KPI routes
router.get('/project/:projectId', getProjectKPIs);
router.post('/project/:projectId', createKPI);
router.patch('/:id', updateKPI);
router.delete('/:id', deleteKPI);

export default router;
