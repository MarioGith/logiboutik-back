import { incomeModel } from '../model';

interface IIncomeHandler {
  getIncome: (req: any, res: any) => Promise<void>;
}

export const incomeHandler: IIncomeHandler = {
  getIncome: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
};

incomeHandler.getIncome = async function (req, res) {
  const docs = await incomeModel.list(req.query.startDate, req.query.endDate);
  res.status(200).json(docs);
};
