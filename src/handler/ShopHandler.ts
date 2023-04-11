import { Request, Response } from 'express';
import { shopModel } from '../model';
import { Types } from 'mongoose';
interface IShopHandler {
  getShops: (req: Request, res: Response) => Promise<void>;
  get: (req: Request, res: Response) => Promise<void>;
  post: (req: Request, res: Response) => Promise<void>;
  put: (req: Request, res: Response) => Promise<void>;
  delete: (req: Request, res: Response) => Promise<void>;
}
export const shopHandler: IShopHandler = {
  getShops: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
  get: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
  post: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
  put: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
  delete: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
};

shopHandler.getShops = async (req, res) => {
  const docs = await shopModel.list();
  res.status(200).json(docs);
};

shopHandler.get = async (req, res) => {
  const docs = await shopModel.read(Types.ObjectId(req.params._id));
  res.status(200).json(docs);
};

shopHandler.post = async (req, res) => {
  const docs = await shopModel.create(req.body);
  if (docs === 'Shop registred') {
    res.status(200).send({ message: 'Shop registred' });
  } else {
    res.status(500).send({ message: 'Shop already exists' });
  }
};

shopHandler.put = async (req, res) => {
  const docs = await shopModel.update(req.body);
  if (docs.message === 'Shop modified') {
    res.status(200).send({ message: 'Shop modified' });
  } else {
    res.status(500).send({ message: 'Error' });
  }
};

shopHandler.delete = async (req, res) => {
  await shopModel.delete(Types.ObjectId(req.params._id));
  res.status(200).send();
};
