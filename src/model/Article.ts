import { Article, Shop, Transaction } from '../schema';
import { badRequest, conflict, notFound } from '../errors';
import { totalStock } from './calculations';

interface ArticleInput {
  name: string;
  price: number;
  shop: string;
}

// `currentName` is the name before an update: keeping it is always allowed,
// so articles that already share a name (older data) stay editable.
async function checkInput(input: ArticleInput, currentName?: string) {
  if (!(await Shop.exists({ _id: input.shop }))) {
    throw badRequest('shop does not exist');
  }
  if (
    input.name !== currentName &&
    (await Article.exists({ name: input.name }))
  ) {
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
    const current = await Article.findById(id);
    if (!current) throw notFound('Article');
    await checkInput(input, current.name);
    return Article.findByIdAndUpdate(id, input, { new: true });
  },

  // Deleting an article also deletes its transactions (historical behavior).
  async delete(id: string) {
    const deleted = await Article.findByIdAndDelete(id);
    if (!deleted) throw notFound('Article');
    await Transaction.deleteMany({ article: id });
  },
};
