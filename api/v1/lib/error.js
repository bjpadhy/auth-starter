class InternalError extends Error {
  constructor(message, data) {
    super(message);
    this.statusCode = 500;
    this.error = this.constructor.name;
    this.details = message;
    this.data = data;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ResourceNotFoundError extends InternalError {
  constructor(message, data) {
    super(message);
    this.statusCode = 404;
    this.data = data;
  }
}

class InvalidRequestSourceError extends InternalError {
  constructor(message, data) {
    super(message);
    this.statusCode = 400;
    this.data = data;
  }
}

class BadRequestInputError extends InternalError {
  constructor(message, data) {
    super(message);
    this.statusCode = 400;
    this.data = data;
  }
}

const errorHandler = ({ error }, response) => {
  return response.status(error.statusCode).json({ isSuccess: false, error });
};

module.exports = {
  errorHandler,
  InternalError,
  ResourceNotFoundError,
  InvalidRequestSourceError,
  BadRequestInputError,
};
