/**
 * Standardized API Response Handler
 * Ensures consistent response format across all endpoints
 */

class ResponseHandler {
  /**
   * Success response for data retrieval (GET requests)
   * @param {Object} res - Express response object
   * @param {Object} data - Response data
   * @param {number} statusCode - HTTP status code (default: 200)
   */
  static success(res, data, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message: null,
      data,
    });
  }

  /**
   * Success response with message (POST, PUT, PATCH, DELETE)
   * @param {Object} res - Express response object
   * @param {string} message - Success message
   * @param {Object} data - Response data (optional)
   * @param {number} statusCode - HTTP status code (default: 200)
   */
  static successWithMessage(res, message, data = null, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Created response (201) for resource creation
   * @param {Object} res - Express response object
   * @param {string} message - Success message
   * @param {Object} data - Created resource data
   */
  static created(res, message, data) {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Success response with pagination
   * @param {Object} res - Express response object
   * @param {Array} items - Array of items
   * @param {Object} pagination - Pagination object
   * @param {number} statusCode - HTTP status code (default: 200)
   */
  static successWithPagination(res, items, pagination, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message: null,
      data: {
        items,
        pagination: {
          currentPage: pagination.currentPage,
          pageSize: pagination.pageSize,
          totalItems: pagination.totalItems,
          totalPages: pagination.totalPages,
          hasNextPage: pagination.hasNextPage,
          hasPrevPage: pagination.hasPrevPage,
        },
      },
    });
  }

  /**
   * Error response (400-499 client errors, 500-599 server errors)
   * @param {Object} res - Express response object
   * @param {string} message - User-friendly error message
   * @param {number} statusCode - HTTP status code (default: 500)
   * @param {Object} errorDetails - Technical error details (optional, only in development)
   */
  static error(res, message, statusCode = 500, errorDetails = null) {
    const response = {
      success: false,
      message,
      data: null,
    };

    // Only include error details in development mode
    if (errorDetails && process.env.NODE_ENV === 'development') {
      response.error = {
        details: errorDetails.message || errorDetails,
        stack: errorDetails.stack,
      };
    }

    return res.status(statusCode).json(response);
  }

  /**
   * Validation error response (400)
   * @param {Object} res - Express response object
   * @param {string|Array} errors - Validation error message or array of field errors
   */
  static validationError(res, errors) {
    if (typeof errors === 'string') {
      return res.status(400).json({
        success: false,
        message: errors,
        data: null,
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Validation error',
      data: null,
      errors,
    });
  }

  /**
   * Not found error (404)
   * @param {Object} res - Express response object
   * @param {string} message - Not found message (default: "Resource not found")
   */
  static notFound(res, message = 'Resource not found') {
    return res.status(404).json({
      success: false,
      message,
      data: null,
    });
  }

  /**
   * Unauthorized error (401)
   * @param {Object} res - Express response object
   * @param {string} message - Unauthorized message (default: "Unauthorized access")
   */
  static unauthorized(res, message = 'Unauthorized access') {
    return res.status(401).json({
      success: false,
      message,
      data: null,
    });
  }

  /**
   * Forbidden error (403)
   * @param {Object} res - Express response object
   * @param {string} message - Forbidden message
   */
  static forbidden(res, message) {
    return res.status(403).json({
      success: false,
      message,
      data: null,
    });
  }

  /**
   * Conflict error (409)
   * @param {Object} res - Express response object
   * @param {string} message - Conflict message
   */
  static conflict(res, message) {
    return res.status(409).json({
      success: false,
      message,
      data: null,
    });
  }

  /**
   * Too many requests error (429)
   * @param {Object} res - Express response object
   * @param {string} message - Rate limit message
   */
  static tooManyRequests(res, message = 'Too many requests. Please try again later.') {
    return res.status(429).json({
      success: false,
      message,
      data: null,
    });
  }

  /**
   * Internal server error (500)
   * @param {Object} res - Express response object
   * @param {string} message - Error message (default: "Internal server error")
   * @param {Object} errorDetails - Technical error details (optional)
   */
  static serverError(res, message = 'Internal server error', errorDetails = null) {
    return this.error(res, message, 500, errorDetails);
  }
}

export default ResponseHandler;
