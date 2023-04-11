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
    requiered: true,
  },
});

export const articleSchema = mongoose.model<ArticleDoc>(
  'Article',
  ArticleSchema
);
