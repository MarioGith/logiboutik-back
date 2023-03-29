import { articleModel } from '../model';

interface IArticleHandler {
  getArticles: (req: any, res: any) => Promise<void>;
  get: (req: any, res: any) => Promise<void>;
  post: (req: any, res: any) => Promise<void>;
  put: (req: any, res: any) => Promise<void>;
  delete: (req: any, res: any) => Promise<void>;
}

export const articleHandler: IArticleHandler = {
  getArticles: function (): Promise<void> {
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

articleHandler.getArticles = async (req, res) => {
  const docs = await articleModel.list();
  res.status(200).json(docs);
};

articleHandler.get = async (req, res) => {
  const docs = await articleModel.read(req.params._id);
  res.status(200).json(docs);
};

articleHandler.post = async (req, res) => {
  const docs = await articleModel.create(req.body);
  if (docs === 'Article registred') {
    res.status(200).send({ message: 'Article registred' });
  } else {
    res.status(500).send({ message: 'Article already exists' });
  }
};

articleHandler.put = async (req, res) => {
  const docs = await articleModel.update(req.body);
  if (docs === 'Article modified') {
    res.status(200).send({ message: 'Article modified' });
  } else {
    res.status(500).send({ message: 'Error' });
  }
};

articleHandler.delete = async (req, res) => {
  await articleModel.delete(req.params._id);
  res.status(200).send();
};
