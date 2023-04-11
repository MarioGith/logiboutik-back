import { transactionModel } from '.';
import { articleModel } from '.';
import mongoose from 'mongoose';

interface IStockModel {
  list: () => Promise<any>;
}

export const stockModel: IStockModel = {
  list: function (): Promise<any> {
    throw new Error('Function not implemented.');
  },
};

stockModel.list = async function () {
  let organizedTransactions = await transactionModel.list();
  organizedTransactions = organizedTransactions.reduce(function (
    pv: { [x: string]: number },
    cv: {
      article: { _id: string; name: string };
      transaction_type: string;
      quantity: number;
    }
  ) {
    if (pv[cv.article._id]) {
      if (cv.transaction_type === 'deposite') {
        pv[cv.article._id] += cv.quantity;
      } else {
        pv[cv.article._id] -= cv.quantity;
      }
    } else {
      if (cv.transaction_type === 'deposite') {
        pv[cv.article._id] = cv.quantity;
      } else {
        pv[cv.article._id] = -cv.quantity;
      }
    }
    return pv;
  }, []);

  let finalStock: any[] = [];

  console.log(organizedTransactions);

  for (const trans in organizedTransactions) {
    const art = await articleModel.read(mongoose.Types.ObjectId(trans));
    if (organizedTransactions[trans] > 0) {
      finalStock = [
        ...finalStock,
        {
          name: art.details.name,
          price: art.details.price,
          quantity: organizedTransactions[trans],
        },
      ];
    }
  }
  return finalStock;
};
