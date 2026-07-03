import { transactionModel } from '.';
import { articleModel } from '.';

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

  let finalIncome: any[] = [];

  // Batch-fetch the referenced articles in one query instead of calling
  // articleModel.read() per article (which re-scanned every transaction).
  const ids = Object.keys(sellingTransactions);
  const articles = await articleModel.list({ _id: { $in: ids } });
  const articlesById: { [id: string]: any } = {};
  articles.forEach((a: any) => {
    articlesById[String(a._id)] = a;
  });

  for (const trans in sellingTransactions) {
    const art = articlesById[trans];
    if (art && sellingTransactions[trans] > 0) {
      finalIncome = [
        ...finalIncome,
        {
          name: art.name,
          price: art.price,
          quantity: sellingTransactions[trans],
        },
      ];
    }
  }
  return finalIncome;
};
