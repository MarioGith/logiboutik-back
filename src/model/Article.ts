import { Article, Shop, Transaction } from '../schema';
import { badRequest, conflict, notFound } from '../errors';
import { totalStock } from './calculations';

interface ArticleInput {
  name: string;
  price: number;
  shop: string;
}

async function checkInput(input: ArticleInput, exceptId?: string) {
  if (!(await Shop.exists({ _id: input.shop }))) {
    throw badRequest('shop does not exist');
  }
  const existing = await Article.findOne({ name: input.name });
  if (existing && String(existing._id) !== exceptId) {
    throw conflict('article_exists', 'Article already exists');
  }
}

export const articleModel = {
  list() {
    return Article.find().populate('shop', 'name').sort({ name: 1 }).lean();
  },

  // Article details, its transaction history and its current stock.
  async read(id: string) {
    const details = await Article.findById(id).lean();
    if (!details) throw notFound('Article');
    const historic = await Transaction.find({ article: id })
      .populate('article', 'name')
      .sort({ date: -1 })
      .lean();
    return { historic, details, stock: totalStock(historic) };
  },

  async create(input: ArticleInput) {
    await checkInput(input);
    return Article.create(input);
  },

  async update(id: string, input: ArticleInput) {
    await checkInput(input, id);
    const updated = await Article.findByIdAndUpdate(id, input, { new: true });
    if (!updated) throw notFound('Article');
    return updated;
  },

  // Deleting an article also deletes its transactions (historical behavior).
  async delete(id: string) {
    const deleted = await Article.findByIdAndDelete(id);
    if (!deleted) throw notFound('Article');
    await Transaction.deleteMany({ article: id });
  },
};
