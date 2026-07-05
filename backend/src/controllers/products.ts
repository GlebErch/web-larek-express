import { NextFunction, Request, Response } from 'express';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import NotFoundError from '../errors/not-found-error';
import { handleMongooseError } from '../middlewares/error-handler';
import { moveImageToPermanent } from '../utils/file';
import { IProductImage } from '../types';

const moveProductImage = async (image: IProductImage): Promise<void> => {
  try {
    await moveImageToPermanent(image.fileName);
  } catch {
    throw new BadRequestError('Ошибка валидации данных при создании товара');
  }
};

export const getProducts = (_req: Request, res: Response, next: NextFunction): void => {
  Product.find({})
    .then((items) => res.send({ items, total: items.length }))
    .catch(next);
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    await moveProductImage(req.body.image);
    const product = await Product.create(req.body);
    res.send(product);
  } catch (error) {
    handleMongooseError(
      error,
      next,
      'Товар с таким title уже существует',
      'Ошибка валидации данных при создании товара',
    );
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (req.body.image) {
      await moveProductImage(req.body.image);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.productId,
      req.body,
      { runValidators: true, new: true },
    );

    if (!product) {
      next(new NotFoundError('Товар с переданным _id не найден'));
      return;
    }

    res.send(product);
  } catch (error) {
    handleMongooseError(
      error,
      next,
      'Товар с таким title уже существует',
      'Ошибка валидации данных при обновлении товара',
    );
  }
};

export const deleteProduct = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  Product.findByIdAndDelete(req.params.productId)
    .then((product) => {
      if (!product) {
        next(new NotFoundError('Товар с переданным _id не найден'));
        return;
      }
      res.send(product);
    })
    .catch(next);
};
