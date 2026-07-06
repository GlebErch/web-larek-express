import { NextFunction, Request, Response } from 'express';
import config from '../config';
import BadRequestError from '../errors/bad-request-error';

const uploadFile = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.file) {
    next(new BadRequestError('Файл не передан'));
    return;
  }

  res.send({
    fileName: `/${config.uploadPathTemp}/${req.file.filename}`,
    originalName: req.file.originalname,
  });
};

export default uploadFile;
