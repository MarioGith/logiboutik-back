// Read-only figures computed from the transactions: stock sheet, invoice
// lines and dashboard totals.
import mongoose from 'mongoose';
import { Article, Transaction } from '../schema';
import { quantityByArticle, stockByArticle } from './calculations';

interface ReportLine {
  name: string;
  price: number;
  quantity: number;
}

// Turns { articleId -> quantity } into invoice/stock lines, keeping only
// positive quantities of articles that still exist, sorted by name.
async function toLines(quantities: Map<string, number>): Promise<ReportLine[]> {
  const ids = [...quantities.keys()];
  const articles = await Article.find({ _id: { $in: ids } }).lean();
  return articles
    .map((article) => ({
      name: article.name,
      price: article.price,
      quantity: quantities.get(String(article._id)) ?? 0,
    }))
    .filter((line) => line.quantity > 0)
    .sort((a, b) => a.name.localeCompare(b.name));
}

function sales(filter: mongoose.FilterQuery<unknown> = {}) {
  return Transaction.find({ ...filter, transaction_type: 'sell' }).lean();
}

export const reportModel = {
  async stock() {
    const transactions = await Transaction.find().lean();
    return toLines(stockByArticle(transactions));
  },

  // Sales between start (included) and end (excluded).
  async income(start: Date, end: Date) {
    const transactions = await sales({ date: { $gte: start, $lt: end } });
    return toLines(quantityByArticle(transactions));
  },

  async totalSell() {
    const transactions = await sales();
    return transactions.reduce((sum, t) => sum + t.quantity, 0);
  },

  async totalIncome() {
    const lines = await toLines(quantityByArticle(await sales()));
    return lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  },

  // Full dump of every collection, used by the "backup" button.
  async backup() {
    const db = mongoose.connection.db;
    const data: Record<string, unknown[]> = {};
    for (const collection of await db.collections()) {
      if (collection.collectionName.startsWith('system.')) continue;
      data[collection.collectionName] = await collection.find({}).toArray();
    }
    return {
      meta: {
        database: db.databaseName,
        exportedAt: new Date().toISOString(),
        collections: Object.keys(data),
      },
      data,
    };
  },
};
