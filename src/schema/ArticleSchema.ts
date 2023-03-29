import mongoose from 'mongoose';

const { Schema } = mongoose;

export interface ArticleDoc extends mongoose.Document {
  name: string;
  price: number;
  shopId: mongoose.Schema.Types.ObjectId;
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
  shopId: {
    ref: '_id',
    type: mongoose.Schema.Types.ObjectId,
  },
});

export const articleSchema = mongoose.model<ArticleDoc>(
  'Article',
  ArticleSchema
);
