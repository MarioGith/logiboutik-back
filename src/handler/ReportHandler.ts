import { Request, Response } from 'express';
import { reportModel } from '../model';
import { parseDateRange } from '../validator';

export const reportHandler = {
  async stock(req: Request, res: Response) {
    res.json(await reportModel.stock());
  },

  async income(req: Request, res: Response) {
    const { start, end } = parseDateRange(req.query);
    res.json(await reportModel.income(start, end));
  },

  async totalSell(req: Request, res: Response) {
    res.json(await reportModel.totalSell());
  },

  async totalIncome(req: Request, res: Response) {
    res.json(await reportModel.totalIncome());
  },

  async backup(req: Request, res: Response) {
    res.json(await reportModel.backup());
  },
};
