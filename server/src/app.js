import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { requestLogger, errorLogger } from './middleware/loggingMiddleware.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import timeEntryRoutes from './routes/timeEntryRoutes.js';
import kpiRoutes from './routes/kpiRoutes.js';
import userRoutes from './routes/userRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(requestLogger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/time-entries', timeEntryRoutes);
app.use('/api/kpis', kpiRoutes);
app.use('/api/users', userRoutes);

// Error Handling
app.use(errorLogger);
app.use(notFound);
app.use(errorHandler);

export default app;