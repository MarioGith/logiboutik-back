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

// Shops are looked up by name in the uniqueness validator.
// Not unique yet — see de-dup note.
ShopSchema.index({ name: 1 });

export const shopSchema = mongoose.model<ShopDoc>('Shop', ShopSchema);
