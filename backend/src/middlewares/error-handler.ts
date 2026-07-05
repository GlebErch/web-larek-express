import { NextFunction, Request, Response } from 'express';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';

interface AppError extends Error {
  statusCode?: number;
}

const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (res.headersSent) {
    next(err);
    return;
  }

  const { statusCode = 500 } = err;
  const message = statusCode === 500
    ? 'На сервере произошла ошибка'
    : err.message;

  res.status(statusCode).send({ message });
};

export default errorHandler;

export const handleMongooseError = (
  error: unknown,
  next: NextFunction,
  conflictMessage: string,
  validationMessage: string,
): void => {
  if (error instanceof Error && error.name === 'ValidationError') {
    next(new BadRequestError(validationMessage));
    return;
  }

  if (error instanceof Error && error.message.includes('E11000')) {
    next(new ConflictError(conflictMessage));
    return;
  }

  next(error as Error);
};

export { BadRequestError, ConflictError, NotFoundError };
