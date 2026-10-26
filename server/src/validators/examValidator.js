import { body, param } from 'express-validator';
import { isPastDate } from '../utils/dateUtils.js';

export const createExamValidation = [
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Subject name must be between 2 and 100 characters'),
  body('examDate')
    .notEmpty()
    .withMessage('Exam date is required')
    .isISO8601()
    .withMessage('Exam date must be a valid ISO 8601 date string')
    .custom((value) => {
      if (isPastDate(value)) {
        throw new Error('Exam date must not be in the past');
      }
      return true;
    }),
];

export const updateExamValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Exam ID must be a positive integer'),
  body('subject')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Subject name cannot be empty')
    .isLength({ min: 2, max: 100 })
    .withMessage('Subject name must be between 2 and 100 characters'),
  body('examDate')
    .optional()
    .isISO8601()
    .withMessage('Exam date must be a valid ISO 8601 date string')
    .custom((value) => {
      if (isPastDate(value)) {
        throw new Error('Exam date must not be in the past');
      }
      return true;
    }),
];

export const examIdParamValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Exam ID must be a positive integer'),
];
