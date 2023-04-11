import { transactionSchema } from '../schema';
import mongoose from 'mongoose';

interface ITransactionModel {
  list: (filter?: any) => Promise<any>;
  create: (newTransaction: any) => Promise<any>;
  read: (_id: mongoose.Types.ObjectId) => Promise<any>;
  update: (updatedTransaction: any) => Promise<any>;
  delete: (_id: mongoose.Types.ObjectId) => Promise<any>;
}

export const transactionModel: ITransactionModel = {
  list: async function (filter = {}) {
    try {
      const transactions = await transactionSchema
        .find(filter)
        .populate('article', 'name')
        .sort('-date');
      return transactions;
    } catch (err) {
      console.error('Error listing transactions:', err);
      throw err;
    }
  },

  create: async function (newArticle) {
    try {
      const _transaction = new transactionSchema({
        article: newArticle.article,
        date: newArticle.date,
        quantity: newArticle.quantity,
        transaction_type: newArticle.transaction_type,
      });
      await _transaction.save();
      return { message: 'Transaction registered' };
    } catch (err) {
      console.error('Error creating transaction:', err);
      throw err;
    }
  },

  read: async function (_id) {
    try {
      const _transaction = await transactionSchema.find({ _id });
      return _transaction;
    } catch (err) {
      console.error('Error reading transaction:', err);
      throw err;
    }
  },

  update: async function (updatedTransaction) {
    try {
      const updated = await transactionSchema.findByIdAndUpdate(
        { _id: updatedTransaction._id },
        {
          article: updatedTransaction.article,
          date: updatedTransaction.date,
          quantity: updatedTransaction.quantity,
          transaction_type: updatedTransaction.transaction_type,
        },
        { new: true }
      );
      if (updated) {
        return { message: 'Transaction modified', data: updated };
      } else {
        return { message: 'Transaction not found', data: null };
      }
    } catch (err) {
      console.error('Error updating transaction:', err);
      throw err;
    }
  },

  delete: async function (_id) {
    try {
      await transactionSchema.findByIdAndDelete({ _id: _id });
      return { message: 'Transaction deleted' };
    } catch (err) {
      console.error('Error deleting transaction:', err);
      throw err;
    }
  },
};
