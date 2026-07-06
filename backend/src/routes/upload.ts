import { Router } from 'express';
import auth from '../middlewares/auth';
import fileMiddleware from '../middlewares/file';
import uploadFile from '../controllers/upload';

const uploadRouter = Router();

uploadRouter.post('/', auth, (req, res, next) => {
  fileMiddleware.single('file')(req, res, (err) => {
    if (err) {
      next(err);
      return;
    }
    uploadFile(req, res, next);
  });
});

export default uploadRouter;
