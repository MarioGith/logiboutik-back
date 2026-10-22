import mongoose from 'mongoose';

export interface ShopDoc extends mongoose.Document {
  name: string;
}

const ShopSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

ShopSchema.index({ name: 1 });

export const Shop = mongoose.model<ShopDoc>('Shop', ShopSchema);
