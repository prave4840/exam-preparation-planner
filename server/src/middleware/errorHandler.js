import { Prisma } from '@prisma/client';

export class AppError extends Error {
  constructor(message, statusCode = 400, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err, req, res, next) => {
  // Operational errors (express-validator, custom AppError)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors.length > 0 && { errors: err.errors }),
    });
  }

  // Prisma Known Request Errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint violation
    if (err.code === 'P2002') {
      const target = Array.isArray(err.meta?.target)
        ? err.meta.target.join(', ')
        : err.meta?.target || 'field';
      
      let friendlyMessage = 'Duplicate record conflict.';
      if (target.includes('subject') || target.includes('examDate')) {
        friendlyMessage = 'An exam with this subject and date already exists.';
      } else if (target.includes('title') || target.includes('examId')) {
        friendlyMessage = 'A study task with this title already exists for this exam.';
      }

      return res.status(409).json({
        success: false,
        message: friendlyMessage,
        errors: [{ field: target, message: friendlyMessage }],
      });
    }

    // Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'The requested record was not found.',
      });
    }

    // Foreign key constraint violation
    if (err.code === 'P2003') {
      return res.status(400).json({
        success: false,
        message: 'Invalid reference: Related record does not exist.',
      });
    }

    // Check constraint or database constraint violation
    if (err.code === 'P2004' || err.code === 'P2010') {
      return res.status(400).json({
        success: false,
        message: 'Database constraint violation. Ensure study duration is between 15 and 480 minutes.',
      });
    }
  }

  // Raw Database check constraint violation message detection (Postgres 23514)
  if (err.message && err.message.includes('check_study_duration')) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed: Study duration must be between 15 and 480 minutes.',
      errors: [{ field: 'minutes', message: 'Study duration must be between 15 and 480 minutes' }],
    });
  }

  // Unexpected / 500 Internal Server Errors
  console.error('Unhandled Server Error:', err);

  const isProduction = process.env.NODE_ENV === 'production';
  return res.status(500).json({
    success: false,
    message: isProduction ? 'An unexpected server error occurred.' : err.message || 'Server error',
    ...(!isProduction && err.stack && { stack: err.stack }),
  });
};
