import { Article, Transaction, TransactionType } from '../schema';
import { badRequest, notFound } from '../errors';

interface TransactionInput {
  article: string;
  date: Date;
  quantity: number;
  transaction_type: TransactionType;
}

async function checkInput(input: TransactionInput) {
  if (!(await Article.exists({ _id: input.article }))) {
    throw badRequest('article does not exist');
  }
}

export const transactionModel = {
  list() {
    return Transaction.find()
      .populate('article', 'name')
      .sort({ date: -1 })
      .lean();
  },

  async read(id: string) {
    const transaction = await Transaction.findById(id).lean();
    if (!transaction) throw notFound('Transaction');
    return transaction;
  },

  async create(input: TransactionInput) {
    await checkInput(input);
    return Transaction.create(input);
  },

  async update(id: string, input: TransactionInput) {
    await checkInput(input);
    const updated = await Transaction.findByIdAndUpdate(id, input, {
      new: true,
    });
    if (!updated) throw notFound('Transaction');
    return updated;
  },

  async delete(id: string) {
    const deleted = await Transaction.findByIdAndDelete(id);
    if (!deleted) throw notFound('Transaction');
  },
};
