import { Router } from 'express';
import * as taskController from '../controllers/taskController.js';
import { validate } from '../middleware/validate.js';
import {
  taskIdParamValidation,
  updateTaskValidation,
} from '../validators/taskValidator.js';

const router = Router();

// General task query route
router.get('/', taskController.getAllTasks);

// Individual task routes
router.get('/:id', validate(taskIdParamValidation), taskController.getTask);
router.patch('/:id', validate(updateTaskValidation), taskController.updateTask);
router.delete('/:id', validate(taskIdParamValidation), taskController.deleteTask);

export default router;
