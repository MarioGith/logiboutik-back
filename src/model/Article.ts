import { articleSchema } from '../schema';
import { articleValidator } from '../validator';
import { transactionModel } from '.';
import mongoose from 'mongoose';

interface IArticleModel {
  list: (filter?: any) => Promise<any>;
  create: (newArticle: any) => Promise<any>;
  read: (_id: mongoose.Types.ObjectId) => Promise<any>;
  update: (updatedArticle: any) => Promise<any>;
  delete: (_id: mongoose.Types.ObjectId) => Promise<any>;
}

export const articleModel: IArticleModel = {
  list: function (): Promise<any> {
    throw new Error('Function not implemented.');
  },
  create: function (): Promise<any> {
    throw new Error('Function not implemented.');
  },
  read: function (): Promise<any> {
    throw new Error('Function not implemented.');
  },
  update: function (): Promise<any> {
    throw new Error('Function not implemented.');
  },
  delete: function (): Promise<any> {
    throw new Error('Function not implemented.');
  },
};

// List
articleModel.list = async function (filter = {}) {
  return await articleSchema.find(filter, function (err, articles) {
    if (err) {
      return err;
    } else {
      return articles;
    }
  });
};

// CRUD

// Create
articleModel.create = async function (newArticle) {
  const alreadyExist = await articleValidator(newArticle.name);
  let saved = false;
  if (!alreadyExist) {
    const _article = new articleSchema();
    _article.name = newArticle.name;
    _article.price = newArticle.price;
    _article.shopId = newArticle.shopId;
    _article.save(function (err) {
      if (err) {
        return err;
      }
    });
    saved = true;
  }
  if (saved) {
    return 'Article registred';
  }
};

// Read
articleModel.read = async function (_id) {
  const historic = await transactionModel.list({ articleId: _id });
  const stock = historic.reduce(
    (pv: number, cv: { transaction_type: string; quantity: number }) => {
      if (cv.transaction_type === 'deposite') {
        return pv + cv.quantity;
      } else {
        return pv - cv.quantity;
      }
    },
    0
  );
  const details = await articleSchema.find(
    { _id: _id },
    function (err, _article) {
      if (err) {
        return err;
      } else {
        return _article;
      }
    }
  );
  return { historic: historic, details: details, stock: stock };
};

// Update
articleModel.update = async function (updatedArticle) {
  return await articleSchema.findByIdAndUpdate(
    { _id: updatedArticle._id },
    {
      name: updatedArticle.name,
      price: updatedArticle.price,
      shopId: updatedArticle.shopId,
    },
    function (err) {
      if (err) {
        return err;
      } else {
        return 'Article modified';
      }
    }
  );
};

// Delete
articleModel.delete = async function (_id) {
  const transactions = await transactionModel.list({ articleId: _id });

  await transactions.forEach(async (trans: { _id: any }) => {
    await transactionModel.delete(trans._id);
  });

  return await articleSchema.findByIdAndDelete({ _id: _id }).catch((err) => {
    return err;
  });
};
