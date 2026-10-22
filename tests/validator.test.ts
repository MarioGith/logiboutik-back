import { describe, expect, it } from 'vitest';
import {
  parseArticleInput,
  parseDate,
  parseDateRange,
  parseTransactionInput,
} from '../src/validator';
import { HttpError } from '../src/errors';

const ID = '5f1d7f5e9c1a2b3c4d5e6f70';

describe('validator', () => {
  it('accepts a French decimal price', () => {
    expect(
      parseArticleInput({ name: ' Pot ', price: '12,5', shop: ID }),
    ).toEqual({
      name: 'Pot',
      price: 12.5,
      shop: ID,
    });
  });

  it('rejects missing or invalid article fields', () => {
    expect(() => parseArticleInput({ price: 1, shop: ID })).toThrow(HttpError);
    expect(() =>
      parseArticleInput({ name: 'a', price: 'abc', shop: ID }),
    ).toThrow(HttpError);
    expect(() => parseArticleInput({ name: 'a', price: -1, shop: ID })).toThrow(
      HttpError,
    );
    expect(() => parseArticleInput({ name: 'a', price: 1, shop: 'x' })).toThrow(
      HttpError,
    );
  });

  it('rejects day/month dates that would be read the wrong way round', () => {
    expect(() => parseDate('05/03/2024', 'date')).toThrow(HttpError);
    expect(parseDate('2024-03-05T23:00:00.000Z', 'date').toISOString()).toBe(
      '2024-03-05T23:00:00.000Z',
    );
  });

  it('only accepts known transaction types and positive quantities', () => {
    const valid = {
      article: ID,
      date: '2024-03-05',
      quantity: '2',
      transaction_type: 'sell',
    };
    expect(parseTransactionInput(valid).quantity).toBe(2);
    expect(() =>
      parseTransactionInput({ ...valid, transaction_type: 'Vendu' }),
    ).toThrow(HttpError);
    expect(() => parseTransactionInput({ ...valid, quantity: 0 })).toThrow(
      HttpError,
    );
  });

  it('requires an ordered date range', () => {
    expect(() => parseDateRange({ startDate: '', endDate: '' })).toThrow(
      HttpError,
    );
    expect(() =>
      parseDateRange({ startDate: '2024-02-01', endDate: '2024-01-01' }),
    ).toThrow(HttpError);
  });
});
