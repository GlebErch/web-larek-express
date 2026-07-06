import { Router } from 'express';
import auth from '../middlewares/auth';
import {
  createProductValidator,
  deleteProductValidator,
  updateProductValidator,
} from '../middlewares/validations';
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../controllers/products';

const productRouter = Router();

productRouter.get('/', getProducts);
productRouter.post('/', auth, createProductValidator, createProduct);
productRouter.patch('/:productId', auth, updateProductValidator, updateProduct);
productRouter.delete('/:productId', auth, deleteProductValidator, deleteProduct);

export default productRouter;
