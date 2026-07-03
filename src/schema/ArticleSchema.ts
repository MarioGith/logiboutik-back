import mongoose from 'mongoose';

const { Schema } = mongoose;

export interface ArticleDoc extends mongoose.Document {
  name: string;
  price: number;
  shop: mongoose.Schema.Types.ObjectId;
}

const ArticleSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  shop: {
    ref: 'Shop',
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
});

// Indexes for the fields used in filtering (articles listed by shop, looked up
// by name in the uniqueness validator). Not unique yet — see de-dup note.
ArticleSchema.index({ shop: 1 });
ArticleSchema.index({ name: 1 });

export const articleSchema = mongoose.model<ArticleDoc>(
  'Article',
  ArticleSchema
);
