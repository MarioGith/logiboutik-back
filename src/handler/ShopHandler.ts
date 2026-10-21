import { Request, Response } from 'express';
import { shopModel } from '../model';
import { parseShopInput } from '../validator';

export const shopHandler = {
  async list(req: Request, res: Response) {
    res.json(await shopModel.list());
  },

  async get(req: Request, res: Response) {
    res.json(await shopModel.read(req.params._id));
  },

  async create(req: Request, res: Response) {
    await shopModel.create(parseShopInput(req.body));
    res.json({ message: 'Shop registered' });
  },

  async update(req: Request, res: Response) {
    await shopModel.update(req.params._id, parseShopInput(req.body));
    res.json({ message: 'Shop modified' });
  },

  async delete(req: Request, res: Response) {
    await shopModel.delete(req.params._id);
    res.status(200).send();
  },
};
