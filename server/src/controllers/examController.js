import * as examService from '../services/examService.js';
import { successResponse } from '../utils/response.js';

export const getExams = async (req, res, next) => {
  try {
    const exams = await examService.getAllExams();
    return successResponse(res, exams, 200);
  } catch (error) {
    next(error);
  }
};

export const getExam = async (req, res, next) => {
  try {
    const exam = await examService.getExamById(req.params.id);
    return successResponse(res, exam, 200);
  } catch (error) {
    next(error);
  }
};

export const createExam = async (req, res, next) => {
  try {
    const exam = await examService.createExam(req.body);
    return successResponse(res, exam, 201, 'Exam created successfully');
  } catch (error) {
    next(error);
  }
};

export const updateExam = async (req, res, next) => {
  try {
    const exam = await examService.updateExam(req.params.id, req.body);
    return successResponse(res, exam, 200, 'Exam updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteExam = async (req, res, next) => {
  try {
    await examService.deleteExam(req.params.id);
    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};
