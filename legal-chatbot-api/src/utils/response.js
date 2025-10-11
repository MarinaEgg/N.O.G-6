/**
 * Utilitaires pour les réponses HTTP standardisées
 */

const createResponse = (statusCode, body, headers = {}) => {
  return {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers
    },
    body: JSON.stringify(body)
  };
};

const success = (data, message = 'Success') => {
  return createResponse(200, {
    success: true,
    message,
    data
  });
};

const created = (data, message = 'Created successfully') => {
  return createResponse(201, {
    success: true,
    message,
    data
  });
};

const badRequest = (message = 'Bad request', errors = null) => {
  return createResponse(400, {
    success: false,
    message,
    errors
  });
};

const notFound = (message = 'Resource not found') => {
  return createResponse(404, {
    success: false,
    message
  });
};

const serverError = (message = 'Internal server error', error = null) => {
  return createResponse(500, {
    success: false,
    message,
    error: process.env.NODE_ENV === 'development' ? error : undefined
  });
};

module.exports = {
  success,
  created,
  badRequest,
  notFound,
  serverError
};
