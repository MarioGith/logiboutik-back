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
transactionModel.list = async function (filter = {}) {
  return await transactionSchema
    .find(filter, function (err, transactions) {
      if (err) {
        return err;
      } else {
        return transactions;
      }
    })
    .sort('-date');
};

// CRUD

// Create
transactionModel.create = async function (newTransaction) {
  const _transaction = new transactionSchema();
  _transaction.articleId = newTransaction.articleId;
  _transaction.date = newTransaction.date;
  _transaction.quantity = newTransaction.quantity;
  _transaction.transaction_type = newTransaction.transaction_type;
  _transaction.save(function (err) {
    if (err) {
      return err;
    }
  });
  return { message: 'Transaction registred' };
};

// Read
transactionModel.read = async function (_id) {
  return await transactionSchema.find(
    { _id: _id },
    function (err, _transaction) {
      if (err) {
        return err;
      } else {
        return _transaction;
      }
    }
  );
};

// Update
transactionModel.update = async function (updatedTransaction) {
  return await transactionSchema.findByIdAndUpdate(
    { _id: updatedTransaction._id },
    {
      articleId: updatedTransaction.articleId,
      date: updatedTransaction.date,
      quantity: updatedTransaction.quantity,
      transaction_type: updatedTransaction.transaction_type,
    },
    function (err) {
      if (err) {
        return err;
      } else {
        return { message: 'Transaction modified' };
      }
    }
  );
};

// Delete
transactionModel.delete = async function (_id) {
  return await transactionSchema
    .findByIdAndDelete({ _id: _id })
    .then(() => {
      return {
        message: 'Transaction deleted',
      };
    })
    .catch((err: any) => {
      return err;
    });
};
