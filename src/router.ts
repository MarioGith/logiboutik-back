import express from 'express';
import {
  articleHandler,
  shopHandler,
  transactionHandler,
  stockHandler,
  incomeHandler,
} from './handler';
import { dashboardHandler } from './handler/DashboardHandler';

export function mainRouter() {
  const router = express.Router();

  router.get('/', (req, res) =>
    res.status(200).json({
      message: 'Logibouik API is up !',
      //version,
    })
  );

  // GET Global
  router.get('/article', (req, res) => articleHandler.getArticles(req, res));
  router.get('/shop', (req, res) => shopHandler.getShops(req, res));
  router.get('/transaction', (req, res) =>
    transactionHandler.getTransactions(req, res)
  );

  // GET Details
  router.get('/article/:_id', (req, res) => articleHandler.get(req, res));
  router.get('/shop/:_id', (req, res) => shopHandler.get(req, res));
  router.get('/transaction/:_id', (req, res) =>
    transactionHandler.get(req, res)
  );

  // POST
  router.post('/article', (req, res) => articleHandler.post(req, res));
  router.post('/shop', (req, res) => shopHandler.post(req, res));
  router.post('/transaction', (req, res) => transactionHandler.post(req, res));

  // UPDATE
  router.post('/article/:_id', (req, res) => articleHandler.put(req, res));
  router.post('/shop/:_id', (req, res) => shopHandler.put(req, res));
  router.post('/transaction/:_id', (req, res) =>
    transactionHandler.put(req, res)
  );

  // DELETE
  router.delete('/article/:_id', (req, res) => articleHandler.delete(req, res));
  router.delete('/shop/:_id', (req, res) => shopHandler.delete(req, res));
  router.delete('/transaction/:_id', (req, res) =>
    transactionHandler.delete(req, res)
  );

  // FACTURE
  router.get('/income', (req, res) => incomeHandler.getIncome(req, res));

  // STOCK
  router.get('/stock', (req, res) => stockHandler.getStock(req, res));

  // DASHBOARD
  router.get('/dashboard/income', (req, res) =>
    dashboardHandler.getTotalIncome(req, res)
  );
  router.get('/dashboard/sell', (req, res) =>
    dashboardHandler.getTotalSell(req, res)
  );

  return router;
}
