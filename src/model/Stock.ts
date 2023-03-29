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
      articleId: string | number;
      transaction_type: string;
      quantity: number;
    }
  ) {
    if (pv[cv.articleId]) {
      if (cv.transaction_type === 'deposite') {
        pv[cv.articleId] += cv.quantity;
      } else {
        pv[cv.articleId] -= cv.quantity;
      }
    } else {
      if (cv.transaction_type === 'deposite') {
        pv[cv.articleId] = cv.quantity;
      } else {
        pv[cv.articleId] = -cv.quantity;
      }
    }
    return pv;
  }, []);

  let finalStock: any[] = [];

  for (const trans in organizedTransactions) {
    const art = await articleModel.read(mongoose.Types.ObjectId(trans));
    if (organizedTransactions[trans] > 0) {
      finalStock = [
        ...finalStock,
        {
          name: art.details[0].name,
          price: art.details[0].price,
          quantity: organizedTransactions[trans],
        },
      ];
    }
  }
  return finalStock;
};
