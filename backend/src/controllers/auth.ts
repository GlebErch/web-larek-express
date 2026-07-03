import { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import User from '../models/user';
import BadRequestError from '../errors/bad-request-error';
import UnauthorizedError from '../errors/unauthorized-error';
import NotFoundError from '../errors/not-found-error';
import { handleMongooseError } from '../middlewares/error-handler';
import {
  clearRefreshTokenCookie,
  createAccessToken,
  createRefreshToken,
  sendAuthResponse,
  verifyToken,
} from '../utils/auth';

const getUserResponse = (user: { email: string; name: string }) => ({
  email: user.email,
  name: user.name,
});

const saveRefreshToken = async (userId: string, refreshToken: string): Promise<void> => {
  await User.findByIdAndUpdate(userId, {
    $push: { tokens: { token: refreshToken } },
  });
};

const removeRefreshToken = async (userId: string, refreshToken: string): Promise<void> => {
  await User.findByIdAndUpdate(userId, {
    $pull: { tokens: { token: refreshToken } },
  });
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password +tokens');

    if (!user) {
      next(new UnauthorizedError('Неверный email или пароль'));
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      next(new UnauthorizedError('Неверный email или пароль'));
      return;
    }

    const payload = { _id: user._id.toString() };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    await saveRefreshToken(user._id.toString(), refreshToken);

    sendAuthResponse(res, getUserResponse(user), accessToken, refreshToken);
  } catch (error) {
    next(error);
  }
};

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const user = await User.create(req.body);
    const payload = { _id: user._id.toString() };
    const accessToken = createAccessToken(payload);
    const refreshToken = createRefreshToken(payload);

    await saveRefreshToken(user._id.toString(), refreshToken);

    sendAuthResponse(res, getUserResponse(user), accessToken, refreshToken);
  } catch (error) {
    handleMongooseError(
      error,
      next,
      'Пользователь с таким email уже существует',
      'Ошибка валидации данных при регистрации пользователя',
    );
  }
};

export const refreshAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    next(new UnauthorizedError('Необходима авторизация'));
    return;
  }

  try {
    const payload = verifyToken(refreshToken);
    const user = await User.findById(payload._id).select('+tokens');

    if (!user) {
      next(new NotFoundError('Пользователь не найден'));
      return;
    }

    const tokenExists = user.tokens.some((item) => item.token === refreshToken);

    if (!tokenExists) {
      next(new UnauthorizedError('Необходима авторизация'));
      return;
    }

    await removeRefreshToken(user._id.toString(), refreshToken);

    const newPayload = { _id: user._id.toString() };
    const accessToken = createAccessToken(newPayload);
    const newRefreshToken = createRefreshToken(newPayload);

    await saveRefreshToken(user._id.toString(), newRefreshToken);

    sendAuthResponse(res, getUserResponse(user), accessToken, newRefreshToken);
  } catch (error) {
    if (error instanceof NotFoundError) {
      next(error);
      return;
    }
    next(new UnauthorizedError('Необходима авторизация'));
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    next(new UnauthorizedError('Необходима авторизация'));
    return;
  }

  try {
    const payload = verifyToken(refreshToken);

    if (!validator.isMongoId(payload._id)) {
      next(new BadRequestError('Некорректные данные пользователя'));
      return;
    }

    const user = await User.findById(payload._id).select('+tokens');

    if (!user) {
      next(new NotFoundError('Пользователь не найден'));
      return;
    }

    await removeRefreshToken(user._id.toString(), refreshToken);
    clearRefreshTokenCookie(res);
    res.send({ success: true });
  } catch (error) {
    if (error instanceof BadRequestError || error instanceof NotFoundError) {
      next(error);
      return;
    }
    next(new UnauthorizedError('Необходима авторизация'));
  }
};

export const getCurrentUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      next(new UnauthorizedError('Необходима авторизация'));
      return;
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      next(new NotFoundError('Пользователь не найден'));
      return;
    }

    res.send({
      user: getUserResponse(user),
      success: true,
    });
  } catch (error) {
    next(error);
  }
};
