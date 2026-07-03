import { Router } from 'express';
import auth from '../middlewares/auth';
import {
  getCurrentUser,
  login,
  logout,
  refreshAccessToken,
  register,
} from '../controllers/auth';
import {
  authHeaderValidator,
  loginValidator,
  registerValidator,
} from '../middlewares/validations';

const authRouter = Router();

authRouter.post('/login', loginValidator, login);
authRouter.post('/register', registerValidator, register);
authRouter.get('/token', refreshAccessToken);
authRouter.get('/logout', logout);
authRouter.get('/user', authHeaderValidator, auth, getCurrentUser);

export default authRouter;
