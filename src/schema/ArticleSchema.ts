import mongoose from 'mongoose';

export interface ArticleDoc extends mongoose.Document {
  name: string;
  price: number;
  shop: mongoose.Types.ObjectId;
}

const ArticleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
});

ArticleSchema.index({ shop: 1 });
ArticleSchema.index({ name: 1 });

export const Article = mongoose.model<ArticleDoc>('Article', ArticleSchema);
