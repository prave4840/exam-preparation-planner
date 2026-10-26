import { Router } from 'express';
import * as examController from '../controllers/examController.js';
import * as taskController from '../controllers/taskController.js';
import { validate } from '../middleware/validate.js';
import {
  createExamValidation,
  updateExamValidation,
  examIdParamValidation,
} from '../validators/examValidator.js';
import {
  createTaskValidation,
  getTasksQueryValidation,
} from '../validators/taskValidator.js';

const router = Router();

// Exam CRUD routes
router.get('/', examController.getExams);
router.get('/:id', validate(examIdParamValidation), examController.getExam);
router.post('/', validate(createExamValidation), examController.createExam);
router.put('/:id', validate(updateExamValidation), examController.updateExam);
router.delete('/:id', validate(examIdParamValidation), examController.deleteExam);

// Tasks belonging to an exam
router.get('/:id/tasks', validate(getTasksQueryValidation), taskController.getTasksByExam);
router.post('/:id/tasks', validate(createTaskValidation), taskController.createTask);

export default router;
