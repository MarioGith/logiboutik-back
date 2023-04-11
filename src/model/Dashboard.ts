import { transactionModel } from '.';
import { articleModel } from '.';
import mongoose from 'mongoose';

interface IDashboardModel {
  totalSell: () => Promise<any>;
  totalIncome: () => Promise<any>;
}

export const dashboardModel: IDashboardModel = {
  totalSell: function (): Promise<any> {
    throw new Error('Function not implemented.');
  },
  totalIncome: function (): Promise<any> {
    throw new Error('Function not implemented.');
  },
};

dashboardModel.totalSell = async function () {
  const sellingTransactions = await transactionModel.list({
    transaction_type: 'sell',
  });
  const totalSell = sellingTransactions.reduce(function (
    pv: any,
    cv: { quantity: any }
  ) {
    pv += cv.quantity;
    return pv;
  },
  0);

  return totalSell;
};

dashboardModel.totalIncome = async function () {
  let sellingTransactions = await transactionModel.list({
    transaction_type: 'sell',
  });

  sellingTransactions = sellingTransactions.reduce(function (
    pv: { [x: string]: any },
    cv: { article: { _id: string; name: string }; quantity: any }
  ) {
    if (pv[cv.article._id]) {
      pv[cv.article._id] += cv.quantity;
    } else {
      pv[cv.article._id] = cv.quantity;
    }
    return pv;
  },
  []);

  let totalIncome = 0;

  for (const trans in sellingTransactions) {
    const art = await articleModel.read(mongoose.Types.ObjectId(trans));
    if (sellingTransactions[trans] > 0) {
      totalIncome += art.details.price * sellingTransactions[trans];
    }
  }

  return totalIncome;
};
