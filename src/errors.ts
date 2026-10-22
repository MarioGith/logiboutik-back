// An error that maps directly to an HTTP response.
// `code` is a stable snake_case identifier the front-end translates;
// `message` is a human-readable English description for logs and debugging.
export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export const badRequest = (message: string) =>
  new HttpError(400, 'invalid_input', message);

export const notFound = (what: string) =>
  new HttpError(404, 'not_found', `${what} not found`);

export const conflict = (code: string, message: string) =>
  new HttpError(409, code, message);
