export const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  // Handle Prisma errors
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        return res.status(400).json({
          message: 'A unique constraint would be violated.',
          details: err.meta
        });
      case 'P2025':
        return res.status(404).json({
          message: 'Record not found.',
          details: err.meta
        });
      default:
        console.error('Database Error:', err);
    }
  }

  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};