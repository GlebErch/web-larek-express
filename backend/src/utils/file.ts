import fs from 'fs/promises';
import path from 'path';
import config from '../config';

export const publicDir = path.join(__dirname, '../public');
export const imagesDir = path.join(publicDir, config.uploadPath);
export const tempDir = path.join(publicDir, config.uploadPathTemp);

export const ensureUploadDirs = async (): Promise<void> => {
  await fs.mkdir(imagesDir, { recursive: true });
  await fs.mkdir(tempDir, { recursive: true });
};

export const moveImageToPermanent = async (fileName: string): Promise<void> => {
  const baseName = path.basename(fileName);
  const sourcePath = path.join(tempDir, baseName);
  const destinationPath = path.join(imagesDir, baseName);

  try {
    await fs.access(sourcePath);
    await fs.rename(sourcePath, destinationPath);
  } catch {
    const existsInImages = await fs.access(destinationPath).then(() => true).catch(() => false);
    if (!existsInImages) {
      throw new Error('Файл изображения не найден во временной директории');
    }
  }
};

export const deleteImageFile = async (fileName: string): Promise<void> => {
  const baseName = path.basename(fileName);
  const filePath = path.join(imagesDir, baseName);

  try {
    await fs.unlink(filePath);
  } catch {
    // файл уже удалён или отсутствует
  }
};

export const cleanTempDirectory = async (): Promise<void> => {
  try {
    const files = await fs.readdir(tempDir);
    await Promise.all(
      files.map((file) => fs.unlink(path.join(tempDir, file))),
    );
  } catch {
    // директория ещё не создана
  }
};
