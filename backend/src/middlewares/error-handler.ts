import { NextFunction, Request, Response } from 'express';
import { isCelebrateError } from 'celebrate';
import multer from 'multer';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';

interface AppError extends Error {
  statusCode?: number;
}

const getCelebrateMessage = (err: unknown): string => {
  if (!isCelebrateError(err)) {
    return 'Ошибка валидации данных';
  }

  const [firstDetail] = [...err.details.values()];

  if (!firstDetail?.message) {
    return 'Ошибка валидации данных';
  }

  return firstDetail.message.replace(/"/g, '');
};

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

  if (isCelebrateError(err)) {
    res.status(400).send({ message: getCelebrateMessage(err) });
    return;
  }

  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Превышен допустимый размер файла'
      : 'Ошибка загрузки файла';
    res.status(400).send({ message });
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
