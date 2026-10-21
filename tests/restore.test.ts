import { describe, expect, it } from 'vitest';
import mongoose from 'mongoose';
import { reviveDocument } from '../src/scripts/restore';

describe('restore', () => {
  it('turns backup strings back into ObjectIds and Dates', () => {
    const doc = reviveDocument({
      _id: '5f1d7f5e9c1a2b3c4d5e6f70',
      article: '5f1d7f5e9c1a2b3c4d5e6f71',
      date: '2024-03-05T23:00:00.000Z',
      quantity: 2,
      transaction_type: 'sell',
    });
    expect(doc._id).toBeInstanceOf(mongoose.Types.ObjectId);
    expect(doc.article).toBeInstanceOf(mongoose.Types.ObjectId);
    expect(doc.date).toEqual(new Date('2024-03-05T23:00:00.000Z'));
    expect(doc.quantity).toBe(2);
  });
});
