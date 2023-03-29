import { transactionModel } from '../model';

interface ITransactionHandler {
  getTransactions: (req: any, res: any) => Promise<void>;
  get: (req: any, res: any) => Promise<void>;
  post: (req: any, res: any) => Promise<void>;
  put: (req: any, res: any) => Promise<void>;
  delete: (req: any, res: any) => Promise<void>;
}

export const transactionHandler: ITransactionHandler = {
  getTransactions: function (): Promise<void> {
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

// HTTP

transactionHandler.getTransactions = async (req, res) => {
  const docs = await transactionModel.list();
  res.status(200).json(docs);
};

transactionHandler.get = async (req, res) => {
  const docs = await transactionModel.read(req.params._id);
  res.status(200).json(docs);
};

transactionHandler.post = async (req, res) => {
  const docs = await transactionModel.create(req.body);
  if (docs === 'Transaction registred') {
    res.status(200).send({ message: 'Transaction registred' });
  } else {
    res.status(500).send({ message: 'Error' });
  }
};

transactionHandler.put = async (req, res) => {
  const docs = await transactionModel.update(req.body);
  if (docs === 'Transaction modified') {
    res.status(200).send({ message: 'Transaction modified' });
  } else {
    res.status(500).send({ message: 'Error' });
  }
};

transactionHandler.delete = async (req, res) => {
  await transactionModel.delete(req.params._id);
  res.status(200).send();
};
