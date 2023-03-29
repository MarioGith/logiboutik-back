import { shopSchema } from '../schema';
import { shopValidator } from '../validator';
import { articleModel } from '.';
import mongoose from 'mongoose';

interface IShopModel {
  list: (filter?: any) => Promise<any>;
  create: (newShop: any) => Promise<any>;
  read: (_id: mongoose.Types.ObjectId) => Promise<any>;
  update: (updatedShop: any) => Promise<any>;
  delete: (_id: mongoose.Types.ObjectId) => Promise<any>;
}

export const shopModel: IShopModel = {
  list: function (): Promise<any> {
    throw new Error('Function not implemented.');
  },
  create: function (): Promise<any> {
    throw new Error('Function not implemented.');
  },
  read: function (): Promise<any> {
    throw new Error('Function not implemented.');
  },
  update: function (): Promise<any> {
    throw new Error('Function not implemented.');
  },
  delete: function (): Promise<any> {
    throw new Error('Function not implemented.');
  },
};

// List
shopModel.list = async function (filter = {}) {
  return await shopSchema.find(filter, function (err, shops) {
    if (err) {
      return err;
    } else {
      return shops;
    }
  });
};

// CRUD

// Create
shopModel.create = async function (newShop) {
  const alreadyExist = await shopValidator(newShop.name);
  let saved = false;
  if (!alreadyExist) {
    const _shop = new shopSchema();
    _shop.name = newShop.name;
    _shop.save(function (err) {
      if (err) {
        return err;
      }
    });
    saved = true;
  }
  if (saved) {
    return 'Shop registred';
  }
};

// Read
shopModel.read = async function (_id) {
  const articles = await articleModel.list({ shopId: _id });
  const details = await shopSchema.find({ _id: _id }, function (err, _shop) {
    if (err) {
      return err;
    } else {
      return _shop;
    }
  });
  return { articles: articles, details: details };
};

// Update
shopModel.update = async function (updatedShop) {
  return await shopSchema.findByIdAndUpdate(
    { _id: updatedShop._id },
    {
      name: updatedShop.name,
    },
    function (err) {
      if (err) {
        return err;
      } else {
        return { message: 'Shop modified' };
      }
    }
  );
};

// Delete
shopModel.delete = async function (_id) {
  return await shopSchema
    .findByIdAndDelete({ _id: _id })
    .then(() => {
      return {
        message: 'Shop deleted',
      };
    })
    .catch((err: any) => {
      return err;
    });
};
