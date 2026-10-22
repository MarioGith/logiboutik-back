import express, { NextFunction, Request, Response } from 'express';
import {
  articleHandler,
  reportHandler,
  shopHandler,
  transactionHandler,
} from './handler';
import { notFound } from './errors';
import { isValidId } from './validator';

type Handler = (req: Request, res: Response) => Promise<void>;

// Forwards errors thrown by async handlers to the error middleware in app.ts.
const wrap =
  (handler: Handler) => (req: Request, res: Response, next: NextFunction) => {
    handler(req, res).catch(next);
  };

// Adds the five CRUD routes of a resource. Updates use POST /<name>/:_id,
// which is what the front-end has always called.
function crud(
  router: express.Router,
  name: string,
  handler: Record<'list' | 'get' | 'create' | 'update' | 'delete', Handler>,
) {
  router.get(`/${name}`, wrap(handler.list));
  router.get(`/${name}/:_id`, wrap(handler.get));
  router.post(`/${name}`, wrap(handler.create));
  router.post(`/${name}/:_id`, wrap(handler.update));
  router.delete(`/${name}/:_id`, wrap(handler.delete));
}

export function mainRouter() {
  const router = express.Router();

  // A malformed id can never match a document: answer 404 right away.
  router.param('_id', (req, res, next, id) =>
    next(isValidId(id) ? undefined : notFound('Document')),
  );

  router.get('/', (req, res) => {
    res.json({ message: 'Logiboutik API is up !' });
  });

  crud(router, 'article', articleHandler);
  crud(router, 'shop', shopHandler);
  crud(router, 'transaction', transactionHandler);

  router.get('/stock', wrap(reportHandler.stock));
  router.get('/income', wrap(reportHandler.income));
  router.get('/dashboard/sell', wrap(reportHandler.totalSell));
  router.get('/dashboard/income', wrap(reportHandler.totalIncome));
  router.get('/backup', wrap(reportHandler.backup));

  return router;
}
