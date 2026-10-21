// Turns untrusted request input into clean values, or throws a 400 error.
// Every write goes through one of the parse*Input functions below, so this
// file is the single place that describes what valid data looks like.
import { badRequest } from '../errors';
import { TRANSACTION_TYPES, TransactionType } from '../schema';

type Body = Record<string, unknown>;

export function isValidId(value: unknown): value is string {
  return typeof value === 'string' && /^[a-f0-9]{24}$/i.test(value);
}

function parseId(value: unknown, field: string): string {
  if (!isValidId(value)) throw badRequest(`${field} is not a valid id`);
  return value;
}

function parseName(value: unknown, field: string): string {
  const name = typeof value === 'string' ? value.trim() : '';
  if (!name) throw badRequest(`${field} is required`);
  if (name.length > 200) throw badRequest(`${field} is too long`);
  return name;
}

// Accepts 12.5, "12.5" and the French "12,5".
function parseNumber(value: unknown, field: string): number {
  const number =
    typeof value === 'string' && value.trim() !== ''
      ? Number(value.replace(',', '.'))
      : value;
  if (typeof number !== 'number' || !Number.isFinite(number)) {
    throw badRequest(`${field} must be a number`);
  }
  return number;
}

// Only ISO dates ("2024-03-05" or "2024-03-05T23:00:00.000Z") are accepted:
// ambiguous formats like "05/03/2024" are read as month/day by JavaScript
// and silently swap day and month.
export function parseDate(value: unknown, field: string): Date {
  const isIso =
    value instanceof Date ||
    (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value));
  const date = isIso ? new Date(value as string | Date) : null;
  if (!date || Number.isNaN(date.getTime())) {
    throw badRequest(`${field} must be an ISO date`);
  }
  return date;
}

export function parseShopInput(body: Body) {
  return { name: parseName(body.name, 'name') };
}

export function parseArticleInput(body: Body) {
  const price = parseNumber(body.price, 'price');
  if (price < 0) throw badRequest('price must be positive');
  return {
    name: parseName(body.name, 'name'),
    price,
    shop: parseId(body.shop, 'shop'),
  };
}

export function parseTransactionInput(body: Body) {
  const quantity = parseNumber(body.quantity, 'quantity');
  if (quantity <= 0) throw badRequest('quantity must be greater than 0');
  const type = body.transaction_type;
  if (!TRANSACTION_TYPES.includes(type as TransactionType)) {
    throw badRequest(`transaction_type must be one of ${TRANSACTION_TYPES}`);
  }
  return {
    article: parseId(body.article, 'article'),
    date: parseDate(body.date, 'date'),
    quantity,
    transaction_type: type as TransactionType,
  };
}

// The range is [startDate, endDate): endDate itself is excluded.
export function parseDateRange(query: Body) {
  const start = parseDate(query.startDate, 'startDate');
  const end = parseDate(query.endDate, 'endDate');
  if (start >= end) throw badRequest('startDate must be before endDate');
  return { start, end };
}
