import { Router } from 'express';
import auth from '../middlewares/auth';
import fileMiddleware from '../middlewares/file';
import uploadFile from '../controllers/upload';

const uploadRouter = Router();

uploadRouter.post('/', auth, fileMiddleware.single('file'), uploadFile);

export default uploadRouter;
