import * as taskService from '../services/taskService.js';
import { successResponse } from '../utils/response.js';

export const getTasksByExam = async (req, res, next) => {
  try {
    const tasks = await taskService.getTasksByExamId(req.params.id, req.query);
    return successResponse(res, tasks, 200);
  } catch (error) {
    next(error);
  }
};

export const getAllTasks = async (req, res, next) => {
  try {
    const tasks = await taskService.getAllTasks(req.query);
    return successResponse(res, tasks, 200);
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    return successResponse(res, task, 200);
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const task = await taskService.createTask(req.params.id, req.body);
    return successResponse(res, task, 201, 'Task created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(req.params.id, req.body);
    return successResponse(res, task, 200, 'Task updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    await taskService.deleteTask(req.params.id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
