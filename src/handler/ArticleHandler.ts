import { Request, Response } from 'express';
import { articleModel } from '../model';
import { parseArticleInput } from '../validator';

export const articleHandler = {
  async list(req: Request, res: Response) {
    res.json(await articleModel.list());
  },

  async get(req: Request, res: Response) {
    res.json(await articleModel.read(req.params._id));
  },

  async create(req: Request, res: Response) {
    await articleModel.create(parseArticleInput(req.body));
    res.json({ message: 'Article registered' });
  },

  async update(req: Request, res: Response) {
    await articleModel.update(req.params._id, parseArticleInput(req.body));
    res.json({ message: 'Article modified' });
  },

  async delete(req: Request, res: Response) {
    await articleModel.delete(req.params._id);
    res.status(200).send();
  },
};
