import { body, param, query } from 'express-validator';

export const createTaskValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Exam ID must be a positive integer'),
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ min: 2, max: 150 })
    .withMessage('Task title must be between 2 and 150 characters'),
  body('plannedDate')
    .notEmpty()
    .withMessage('Planned date is required')
    .isISO8601()
    .withMessage('Planned date must be a valid ISO 8601 date string'),
  body('minutes')
    .notEmpty()
    .withMessage('Study duration in minutes is required')
    .isInt({ min: 15, max: 480 })
    .withMessage('Study duration must be between 15 and 480 minutes'),
];

export const updateTaskValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Task ID must be a positive integer'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty')
    .isLength({ min: 2, max: 150 })
    .withMessage('Task title must be between 2 and 150 characters'),
  body('plannedDate')
    .optional()
    .isISO8601()
    .withMessage('Planned date must be a valid ISO 8601 date string'),
  body('minutes')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Study duration must be between 15 and 480 minutes'),
  body('done')
    .optional()
    .isBoolean()
    .withMessage('Completion status must be a boolean'),
];

export const taskIdParamValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Task ID must be a positive integer'),
];

export const getTasksQueryValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Exam ID must be a positive integer'),
  query('done')
    .optional()
    .isIn(['true', 'false', 'all'])
    .withMessage('Filter "done" must be true, false, or all'),
  query('filter')
    .optional()
    .isIn(['all', 'pending', 'completed', 'today', 'upcoming'])
    .withMessage('Filter must be one of: all, pending, completed, today, upcoming'),
];
