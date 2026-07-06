import { Joi, Segments, celebrate } from 'celebrate';
import validator from 'validator';
import { PRODUCT_CATEGORIES } from '../types';

const objectId = Joi.string().custom((value, helpers) => {
  if (!validator.isMongoId(value)) {
    return helpers.error('any.invalid');
  }
  return value;
}, 'ObjectId validation');

const imageSchema = Joi.object({
  fileName: Joi.string().required(),
  originalName: Joi.string().required(),
});

export const createProductValidator = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(2).max(30).required(),
    image: imageSchema.required(),
    category: Joi.string().valid(...PRODUCT_CATEGORIES).required(),
    description: Joi.string().optional().allow(''),
    price: Joi.number().allow(null).optional(),
  }),
});

export const updateProductValidator = celebrate({
  [Segments.PARAMS]: Joi.object({
    productId: objectId.required(),
  }),
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(2).max(30).optional(),
    image: imageSchema.optional(),
    category: Joi.string().valid(...PRODUCT_CATEGORIES).optional(),
    description: Joi.string().optional().allow(''),
    price: Joi.number().allow(null).optional(),
  }).min(1),
});

export const deleteProductValidator = celebrate({
  [Segments.PARAMS]: Joi.object({
    productId: objectId.required(),
  }),
});

export const createOrderValidator = celebrate({
  [Segments.BODY]: Joi.object({
    payment: Joi.string().valid('card', 'online').required(),
    email: Joi.string().required().custom((value, helpers) => {
      if (!validator.isEmail(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    total: Joi.number().required(),
    items: Joi.array().items(objectId).min(1).required(),
  }),
});

export const loginValidator = celebrate({
  [Segments.BODY]: Joi.object({
    email: Joi.string().required().custom((value, helpers) => {
      if (!validator.isEmail(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
    password: Joi.string().min(6).required(),
  }),
});

export const registerValidator = celebrate({
  [Segments.BODY]: Joi.object({
    name: Joi.string().min(2).max(30).optional(),
    email: Joi.string().required().custom((value, helpers) => {
      if (!validator.isEmail(value)) {
        return helpers.error('any.invalid');
      }
      return value;
    }),
    password: Joi.string().min(6).required(),
  }),
});
