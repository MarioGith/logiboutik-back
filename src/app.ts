import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import { mainRouter } from './router';
import { HttpError } from './errors';

export function createApp(corsOrigins: string[]) {
  const app = express();

  app.disable('x-powered-by');
  // cors first, so even error responses (e.g. invalid JSON) can be read by
  // the browser.
  app.use(cors({ credentials: true, origin: corsOrigins }));
  app.use(express.json());
  // Strips keys starting with "$" from the input (MongoDB operator injection).
  app.use(mongoSanitize());

  app.use('/', mainRouter());

  app.use((req, res) => {
    res.status(404).json({ code: 'not_found', message: 'Route not found' });
  });

  // Every error ends here and becomes a JSON { code, message } response.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof HttpError) {
      res.status(err.status).json({ code: err.code, message: err.message });
    } else if (err.type === 'entity.parse.failed') {
      res.status(400).json({ code: 'invalid_input', message: 'Invalid JSON' });
    } else {
      console.error(`${req.method} ${req.originalUrl} failed:`, err);
      res
        .status(500)
        .json({ code: 'server_error', message: 'Internal server error' });
    }
  });

  return app;
}
