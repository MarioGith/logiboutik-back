import mongoose from 'mongoose';

const { Schema } = mongoose;

export interface TransactionDoc extends mongoose.Document {
  article: mongoose.Schema.Types.ObjectId;
  date: Date;
  quantity: number;
  transaction_type: string;
}

const TransactionSchema = new Schema({
  article: {
    ref: 'Article',
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  transaction_type: {
    type: String,
    required: true,
  },
});

// Indexes for the fields used in filtering/sorting (list is sorted by -date,
// income/dashboard/stock filter by transaction_type and group by article).
TransactionSchema.index({ article: 1 });
TransactionSchema.index({ date: -1 });
TransactionSchema.index({ transaction_type: 1 });

export const transactionSchema = mongoose.model<TransactionDoc>(
  'Transaction',
  TransactionSchema
);
