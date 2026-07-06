import { Document, Types } from 'mongoose';

export interface IProductImage {
  fileName: string;
  originalName: string;
}

export interface IProduct extends Document {
  title: string;
  image: IProductImage;
  category: string;
  description?: string;
  price: number | null;
}

export interface IUserToken {
  token: string;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  tokens: IUserToken[];
}

export interface ITokenPayload {
  _id: string;
}

export type ProductCategory =
  | 'софт-скил'
  | 'хард-скил'
  | 'другое'
  | 'дополнительное'
  | 'кнопка';

export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'софт-скил',
  'хард-скил',
  'другое',
  'дополнительное',
  'кнопка',
];

declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload;
    }
  }
}

export type ObjectId = Types.ObjectId;
