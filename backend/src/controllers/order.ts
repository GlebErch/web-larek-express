import { NextFunction, Request, Response } from 'express';
import { faker } from '@faker-js/faker';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { items, total } = req.body;
    const products = await Product.find({ _id: { $in: items } });

    if (products.length !== items.length) {
      next(new BadRequestError('Ошибка валидации данных при создании заказа'));
      return;
    }

    const hasUnavailableProduct = products.some((product) => product.price === null);

    if (hasUnavailableProduct) {
      next(new BadRequestError('Ошибка валидации данных при создании заказа'));
      return;
    }

    const calculatedTotal = products.reduce((sum, product) => sum + (product.price ?? 0), 0);

    if (calculatedTotal !== total) {
      next(new BadRequestError('Ошибка валидации данных при создании заказа'));
      return;
    }

    res.send({
      id: faker.string.uuid(),
      total: calculatedTotal,
    });
  } catch (error) {
    next(error);
  }
};

export default createOrder;
