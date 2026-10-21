import mongoose from 'mongoose';

// 'deposite' (sic) is the value stored in the database since day one:
// keep the spelling, renaming it would require rewriting every transaction.
export const TRANSACTION_TYPES = ['deposite', 'sell', 'retrieve'] as const;
export type TransactionType = (typeof TRANSACTION_TYPES)[number];

export interface TransactionDoc extends mongoose.Document {
  article: mongoose.Types.ObjectId;
  date: Date;
  quantity: number;
  transaction_type: TransactionType;
}

const TransactionSchema = new mongoose.Schema({
  article: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Article',
    required: true,
  },
  date: { type: Date, required: true },
  quantity: { type: Number, required: true },
  transaction_type: { type: String, enum: TRANSACTION_TYPES, required: true },
});

TransactionSchema.index({ article: 1 });
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ transaction_type: 1 });

export const Transaction = mongoose.model<TransactionDoc>(
  'Transaction',
  TransactionSchema,
);
