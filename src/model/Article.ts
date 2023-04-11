import { articleSchema, ArticleDoc, TransactionDoc } from '../schema';
import { articleValidator } from '../validator';
import { transactionModel } from '.';
import mongoose from 'mongoose';

interface IArticleModel {
  list: (filter?: any) => Promise<any>;
  create: (newArticle: ArticleDoc) => Promise<{ message: string }>;
  read: (_id: mongoose.Types.ObjectId) => Promise<any>;
  update: (
    updatedArticle: ArticleDoc
  ) => Promise<{ message: string; data?: ArticleDoc | null; error?: any }>;
  delete: (_id: mongoose.Types.ObjectId) => Promise<any>;
}

export const articleModel: IArticleModel = {
  list: async function (filter = {}) {
    try {
      const articles = await articleSchema
        .find(filter)
        .populate('shop', 'name');
      return articles;
    } catch (err) {
      console.error('Error listing articles:', err);
      throw err;
    }
  },

  create: async function (newArticle) {
    try {
      const alreadyExist = await articleValidator(newArticle.name);
      if (alreadyExist) {
        return { message: 'Article already exists' };
      }

      const _article = new articleSchema({
        name: newArticle.name,
        price: newArticle.price,
        shop: newArticle.shop,
      });

      await _article.save();
      return { message: 'Article registered' };
    } catch (err) {
      console.error('Error creating article:', err);
      throw err;
    }
  },

  read: async function (_id) {
    try {
      const historic = await transactionModel.list({ article: _id });
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
      const details = await articleSchema.findById(_id);
      return { historic: historic, details: details, stock: stock };
    } catch (err) {
      console.error('Error reading article:', err);
      throw err;
    }
  },

  update: async function (updatedArticle) {
    try {
      const updated = await articleSchema.findByIdAndUpdate(
        { _id: updatedArticle._id },
        {
          name: updatedArticle.name,
          price: updatedArticle.price,
          shop: updatedArticle.shop,
        },
        { new: true }
      );

      if (updated) {
        return { message: 'Article modified', data: updated };
      } else {
        return { message: 'Article not found', data: null };
      }
    } catch (err) {
      console.error('Error updating article:', err);
      return { message: 'Error updating article', error: err };
    }
  },

  delete: async function (_id) {
    try {
      const transactions = await transactionModel.list({ article: _id });

      await Promise.all(
        transactions.map(async (trans: TransactionDoc) => {
          await transactionModel.delete(trans._id);
        })
      );

      await articleSchema.findByIdAndDelete({ _id: _id });
      return { message: 'Article deleted' };
    } catch (err) {
      console.error('Error deleting article:', err);
      throw err;
    }
  },
};
