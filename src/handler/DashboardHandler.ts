import { dashboardModel } from '../model';

interface IDashboardHandler {
  getTotalSell: (req: any, res: any) => Promise<void>;
  getTotalIncome: (req: any, res: any) => Promise<void>;
}

export const dashboardHandler: IDashboardHandler = {
  getTotalSell: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
  getTotalIncome: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
};

dashboardHandler.getTotalSell = async function (res) {
  const docs = await dashboardModel.totalSell();
  res.status(200).json(docs);
};

dashboardHandler.getTotalIncome = async function (res) {
  const docs = await dashboardModel.totalIncome();
  res.status(200).json(docs);
};
