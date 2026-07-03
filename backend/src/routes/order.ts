import { Router } from 'express';
import { createOrderValidator } from '../middlewares/validations';
import createOrder from '../controllers/order';

const orderRouter = Router();

orderRouter.post('/', createOrderValidator, createOrder);

export default orderRouter;
