import { transactionModel } from '.';
import { articleModel } from '.';

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

  // Batch-fetch the referenced articles in one query instead of calling
  // articleModel.read() per article (which re-scanned every transaction).
  const ids = Object.keys(organizedTransactions);
  const articles = await articleModel.list({ _id: { $in: ids } });
  const articlesById: { [id: string]: any } = {};
  articles.forEach((a: any) => {
    articlesById[String(a._id)] = a;
  });

  for (const trans in organizedTransactions) {
    const art = articlesById[trans];
    if (art && organizedTransactions[trans] > 0) {
      finalStock = [
        ...finalStock,
        {
          name: art.name,
          price: art.price,
          quantity: organizedTransactions[trans],
        },
      ];
    }
  }
  return finalStock;
};
