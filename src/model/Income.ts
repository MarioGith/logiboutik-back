import { transactionModel } from '.';
import { articleModel } from '.';
import mongoose from 'mongoose';

interface IIncomeModel {
  list: (startDate?: string, endDate?: string) => Promise<any>;
}

export const incomeModel: IIncomeModel = {
  list: function (): Promise<any> {
    throw new Error('Function not implemented.');
  },
};

incomeModel.list = async function (startDate = '', endDate = '') {
  let sellingTransactions = await transactionModel.list({
    $and: [
      { date: { $gte: startDate } },
      { date: { $lt: endDate } },
      { transaction_type: 'sell' },
    ],
  });
  sellingTransactions = sellingTransactions.reduce(function (
    pv: { [x: string]: any },
    cv: { articleId: string | number; quantity: any }
  ) {
    if (pv[cv.articleId]) {
      pv[cv.articleId] += cv.quantity;
    } else {
      pv[cv.articleId] = cv.quantity;
    }
    return pv;
  },
  []);

  let finalIncome: any[] = [];

  for (const trans in sellingTransactions) {
    const art = await articleModel.read(mongoose.Types.ObjectId(trans));
    if (sellingTransactions[trans] > 0) {
      finalIncome = [
        ...finalIncome,
        {
          name: art.details[0].name,
          price: art.details[0].price,
          quantity: sellingTransactions[trans],
        },
      ];
    }
  }
  return finalIncome;
};
