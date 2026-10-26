/**
 * Standardized API Response Utilities
 */

export const successResponse = (res, data, statusCode = 200, message = null) => {
  const body = {
    success: true,
    ...(message && { message }),
    data,
  };
  return res.status(statusCode).json(body);
};

export const errorResponse = (res, message, statusCode = 400, errors = []) => {
  const body = {
    success: false,
    message,
    ...(errors.length > 0 && { errors }),
  };
  return res.status(statusCode).json(body);
};
