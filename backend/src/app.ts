import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import cron from 'node-cron';
import { errors } from 'celebrate';
import config from './config';
import router from './routes';
import { requestLogger, errorLogger } from './middlewares/logger';
import errorHandler from './middlewares/error-handler';
import NotFoundError from './errors/not-found-error';
import { cleanTempDirectory, ensureUploadDirs, publicDir } from './utils/file';

const app = express();

app.use(cors({
  origin: config.originAllow,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(publicDir));
app.use(requestLogger);
app.use(router);
app.use((_req, _res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

const start = async (): Promise<void> => {
  await ensureUploadDirs();

  cron.schedule('0 * * * *', () => {
    cleanTempDirectory();
  });

  await mongoose.connect(config.dbAddress);
  app.listen(config.port);
};

start().catch(() => {
  process.exit(1);
});

export default app;
