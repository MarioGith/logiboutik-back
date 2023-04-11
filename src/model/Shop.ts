import { shopSchema, ShopDoc } from '../schema';
import { shopValidator } from '../validator';
import { articleModel } from '.';
import { Types } from 'mongoose';

interface IShopModel {
  list: (filter?: any) => Promise<Array<ShopDoc>>;
  create: (newShop: any) => Promise<string>;
  read: (
    _id: Types.ObjectId
  ) => Promise<{ articles: any; details: ShopDoc | null }>;
  update: (
    updatedShop: any
  ) => Promise<{ message: string; data: ShopDoc | null }>;
  delete: (_id: Types.ObjectId) => Promise<{ message: string; data?: any }>;
}

export const shopModel: IShopModel = {
  list: async function (filter = {}) {
    try {
      const shops = await shopSchema.find(filter);
      return shops;
    } catch (err: any) {
      console.error('Error listing shops:', err);
      return [];
    }
  },

  create: async function (newShop) {
    try {
      const alreadyExist = await shopValidator(newShop.name);
      if (!alreadyExist) {
        const _shop = new shopSchema();
        _shop.name = newShop.name;
        await _shop.save();
        return 'Shop registered';
      } else {
        throw new Error('Shop already exists');
      }
    } catch (err: any) {
      console.error('Error creating shop:', err);
      return err.message;
    }
  },

  read: async function (_id) {
    try {
      const articles = await articleModel.list({ shop: _id });
      const details = await shopSchema.findById(_id);
      return { articles: articles, details: details };
    } catch (err: any) {
      console.error('Error reading shop:', err);
      return { articles: [], details: null };
    }
  },

  update: async function (updatedShop) {
    try {
      const updated = await shopSchema.findByIdAndUpdate(
        { _id: updatedShop._id },
        {
          name: updatedShop.name,
        },
        { new: true } // This option returns the modified document rather than the original
      );

      if (updated) {
        return { message: 'Shop modified', data: updated };
      } else {
        return { message: 'Shop not found', data: null };
      }
    } catch (err: any) {
      console.error('Error updating shop:', err);
      return { message: 'Error updating shop', data: null };
    }
  },

  delete: async function (_id) {
    try {
      await shopSchema.findByIdAndDelete({ _id: _id });
      return {
        message: 'Shop deleted',
      };
    } catch (err: any) {
      console.error('Error deleting shop:', err);
      return { message: 'Error deleting shop' };
    }
  },
};
