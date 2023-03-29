import mongoose from 'mongoose';

const { Schema } = mongoose;

export interface ShopDoc extends mongoose.Document {
  name: string;
}

const ShopSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
});

export const shopSchema = mongoose.model<ShopDoc>('Shop', ShopSchema);
