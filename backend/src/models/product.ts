import fs from 'fs/promises';
import path from 'path';
import mongoose, { Schema } from 'mongoose';
import config from '../config';
import { IProduct } from '../types';

const productSchema = new Schema<IProduct>(
  {
    title: {
      type: String,
      unique: true,
      required: [true, 'Поле "title" должно быть заполнено'],
      minlength: [2, 'Минимальная длина поля "title" - 2'],
      maxlength: [30, 'Максимальная длина поля "title" - 30'],
    },
    image: {
      fileName: {
        type: String,
        required: [true, 'Поле "image.fileName" должно быть заполнено'],
      },
      originalName: {
        type: String,
        required: [true, 'Поле "image.originalName" должно быть заполнено'],
      },
    },
    category: {
      type: String,
      required: [true, 'Поле "category" должно быть заполнено'],
    },
    description: {
      type: String,
    },
    price: {
      type: Number,
      default: null,
    },
  },
  { versionKey: false },
);

productSchema.post('findOneAndDelete', async (doc: IProduct | null) => {
  if (!doc) {
    return;
  }

  const fileName = path.basename(doc.image.fileName);
  const filePath = path.join(__dirname, '../public', config.uploadPath, fileName);

  try {
    await fs.unlink(filePath);
  } catch {
    // файл уже удалён или отсутствует
  }
});

export default mongoose.model<IProduct>('product', productSchema);
