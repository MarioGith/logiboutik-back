import { stockModel } from '../model';

interface IStockHandler {
  getStock: (req: any, res: any) => Promise<void>;
}

export const stockHandler: IStockHandler = {
  getStock: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
};

stockHandler.getStock = async function (res) {
  const docs = await stockModel.list();
  res.status(200).json(docs);
};
