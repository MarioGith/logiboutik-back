import { Request, Response } from 'express';
import { transactionModel } from '../model';
import { parseTransactionInput } from '../validator';

export const transactionHandler = {
  async list(req: Request, res: Response) {
    res.json(await transactionModel.list());
  },

  // Answers with a one-element array: that is the format the front-end has
  // always read, kept so old and new front-ends both work.
  async get(req: Request, res: Response) {
    res.json([await transactionModel.read(req.params._id)]);
  },

  async create(req: Request, res: Response) {
    await transactionModel.create(parseTransactionInput(req.body));
    res.json({ message: 'Transaction registered' });
  },

  async update(req: Request, res: Response) {
    await transactionModel.update(
      req.params._id,
      parseTransactionInput(req.body),
    );
    res.json({ message: 'Transaction modified' });
  },

  async delete(req: Request, res: Response) {
    await transactionModel.delete(req.params._id);
    res.status(200).send();
  },
};
