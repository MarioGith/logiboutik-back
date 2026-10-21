import { Article, Shop } from '../schema';
import { conflict, notFound } from '../errors';

interface ShopInput {
  name: string;
}

async function ensureNameIsFree(name: string, exceptId?: string) {
  const existing = await Shop.findOne({ name });
  if (existing && String(existing._id) !== exceptId) {
    throw conflict('shop_exists', 'Shop already exists');
  }
}

export const shopModel = {
  list() {
    return Shop.find().sort({ name: 1 }).lean();
  },

  async read(id: string) {
    const details = await Shop.findById(id).lean();
    if (!details) throw notFound('Shop');
    const articles = await Article.find({ shop: id })
      .populate('shop', 'name')
      .sort({ name: 1 })
      .lean();
    return { articles, details };
  },

  async create(input: ShopInput) {
    await ensureNameIsFree(input.name);
    return Shop.create(input);
  },

  async update(id: string, input: ShopInput) {
    await ensureNameIsFree(input.name, id);
    const updated = await Shop.findByIdAndUpdate(id, input, { new: true });
    if (!updated) throw notFound('Shop');
    return updated;
  },

  // A shop that still has articles cannot be deleted: it would leave
  // articles pointing to nothing.
  async delete(id: string) {
    if (await Article.exists({ shop: id })) {
      throw conflict('shop_has_articles', 'Shop still has articles');
    }
    const deleted = await Shop.findByIdAndDelete(id);
    if (!deleted) throw notFound('Shop');
  },
};
