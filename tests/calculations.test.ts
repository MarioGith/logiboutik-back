import { describe, expect, it } from 'vitest';
import {
  quantityByArticle,
  stockByArticle,
  totalStock,
} from '../src/model/calculations';

const move = (
  article: unknown,
  transaction_type: string,
  quantity: number,
) => ({
  article,
  transaction_type,
  quantity,
});

describe('stock calculations', () => {
  it('adds deposits and removes sales and retrievals', () => {
    const movements = [
      move('a', 'deposite', 10),
      move('a', 'sell', 3),
      move('a', 'retrieve', 2),
      move('b', 'deposite', 4),
    ];
    expect(totalStock(movements)).toBe(9);
    expect(stockByArticle(movements)).toEqual(
      new Map([
        ['a', 5],
        ['b', 4],
      ]),
    );
  });

  it('accepts populated articles and skips deleted ones', () => {
    const movements = [
      move({ _id: 'a', name: 'pot' }, 'deposite', 2),
      move(null, 'deposite', 99),
      move('a', 'deposite', 1),
    ];
    expect(stockByArticle(movements)).toEqual(new Map([['a', 3]]));
  });

  it('keeps counting after the stock reaches zero', () => {
    const movements = [
      move('a', 'deposite', 2),
      move('a', 'sell', 2),
      move('a', 'deposite', 5),
    ];
    expect(stockByArticle(movements).get('a')).toBe(5);
  });

  it('sums quantities per article', () => {
    const sales = [
      move('a', 'sell', 2),
      move('a', 'sell', 3),
      move('b', 'sell', 1),
    ];
    expect(quantityByArticle(sales)).toEqual(
      new Map([
        ['a', 5],
        ['b', 1],
      ]),
    );
  });
});
