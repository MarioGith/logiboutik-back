import express from 'express';
import {
  articleHandler,
  shopHandler,
  transactionHandler,
  stockHandler,
  incomeHandler,
  backupHandler,
} from './handler';
import { dashboardHandler } from './handler/DashboardHandler';

// Wraps an async route handler so any rejection is forwarded to Express'
// error-handling middleware instead of leaving the request hanging.
const wrap =
  (fn: (req: express.Request, res: express.Response) => Promise<void>) =>
  (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void => {
    Promise.resolve(fn(req, res)).catch(next);
  };

export function mainRouter() {
  const router = express.Router();

  router.get('/', (req, res) =>
    res.status(200).json({
      message: 'Logibouik API is up !',
      //version,
    })
  );

  // GET Global
  router.get(
    '/article',
    wrap((req, res) => articleHandler.getArticles(req, res))
  );
  router.get(
    '/shop',
    wrap((req, res) => shopHandler.getShops(req, res))
  );
  router.get(
    '/transaction',
    wrap((req, res) => transactionHandler.getTransactions(req, res))
  );

  // GET Details
  router.get(
    '/article/:_id',
    wrap((req, res) => articleHandler.get(req, res))
  );
  router.get(
    '/shop/:_id',
    wrap((req, res) => shopHandler.get(req, res))
  );
  router.get(
    '/transaction/:_id',
    wrap((req, res) => transactionHandler.get(req, res))
  );

  // POST
  router.post(
    '/article',
    wrap((req, res) => articleHandler.post(req, res))
  );
  router.post(
    '/shop',
    wrap((req, res) => shopHandler.post(req, res))
  );
  router.post(
    '/transaction',
    wrap((req, res) => transactionHandler.post(req, res))
  );

  // UPDATE
  router.post(
    '/article/:_id',
    wrap((req, res) => articleHandler.put(req, res))
  );
  router.post(
    '/shop/:_id',
    wrap((req, res) => shopHandler.put(req, res))
  );
  router.post(
    '/transaction/:_id',
    wrap((req, res) => transactionHandler.put(req, res))
  );

  // DELETE
  router.delete(
    '/article/:_id',
    wrap((req, res) => articleHandler.delete(req, res))
  );
  router.delete(
    '/shop/:_id',
    wrap((req, res) => shopHandler.delete(req, res))
  );
  router.delete(
    '/transaction/:_id',
    wrap((req, res) => transactionHandler.delete(req, res))
  );

  // FACTURE
  router.get(
    '/income',
    wrap((req, res) => incomeHandler.getIncome(req, res))
  );

  // STOCK
  router.get(
    '/stock',
    wrap((req, res) => stockHandler.getStock(req, res))
  );

  // DASHBOARD
  router.get(
    '/dashboard/income',
    wrap((req, res) => dashboardHandler.getTotalIncome(req, res))
  );
  router.get(
    '/dashboard/sell',
    wrap((req, res) => dashboardHandler.getTotalSell(req, res))
  );

  // BACKUP
  router.get(
    '/backup',
    wrap((req, res) => backupHandler.getBackup(req, res))
  );

  return router;
}
