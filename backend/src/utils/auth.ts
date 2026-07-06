import jwt from 'jsonwebtoken';
import ms from 'ms';
import type { StringValue } from 'ms';
import { CookieOptions, Response } from 'express';
import config from '../config';
import { ITokenPayload } from '../types';

export const createAccessToken = (payload: ITokenPayload): string => jwt.sign(
  payload,
  config.authJwtSecret,
  { expiresIn: config.authAccessTokenExpiry as StringValue },
);

export const createRefreshToken = (payload: ITokenPayload): string => jwt.sign(
  payload,
  config.authJwtSecret,
  { expiresIn: config.authRefreshTokenExpiry as StringValue },
);

export const verifyToken = (token: string): ITokenPayload => jwt.verify(
  token,
  config.authJwtSecret,
) as ITokenPayload;

export const refreshCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  maxAge: ms(config.authRefreshTokenExpiry as StringValue),
  path: '/',
};

export const expiredCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: false,
  maxAge: 0,
  path: '/',
};

export const setRefreshTokenCookie = (res: Response, token: string): void => {
  res.cookie('refreshToken', token, refreshCookieOptions);
};

export const clearRefreshTokenCookie = (res: Response): void => {
  res.cookie('refreshToken', '', expiredCookieOptions);
};

export const sendAuthResponse = (
  res: Response,
  user: { email: string; name: string },
  accessToken: string,
  refreshToken: string,
): Response => {
  setRefreshTokenCookie(res, refreshToken);
  return res.send({
    user,
    success: true,
    accessToken,
  });
};
