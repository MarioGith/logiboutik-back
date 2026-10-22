// Checks the database for problems left by older versions of Logiboutik and
// fixes the ones that can be fixed without any guesswork.
//
//   pnpm migrate           -> report only, changes nothing
//   pnpm migrate --apply   -> also applies the safe fixes
//
// Safe to run several times: once fixed, a problem is not reported again.
import mongoose from 'mongoose';
import { config } from '../config';
import { connectDatabase, disconnectDatabase } from '../database';
import { Article, Shop, Transaction, TRANSACTION_TYPES } from '../schema';

// Before v1.1 the transaction edit page saved the *translated* label
// ("Vendu") instead of the code ("sell"). Those transactions were ignored
// by the income and dashboard totals and counted wrong in the stock.
const LABEL_TO_TYPE: Record<string, string> = {
  vendu: 'sell',
  déposé: 'deposite',
  deposé: 'deposite',
  repris: 'retrieve',
  retiré: 'retrieve',
};

const apply = process.argv.includes('--apply');

const formatDay = (date: unknown) =>
  date instanceof Date ? date.toISOString().slice(0, 10) : String(date);

// The same bug sent the date as "DD/MM/YYYY", which the server read as
// "MM/DD/YYYY": day and month were swapped. The original date cannot be
// known for sure, so dates are only listed for a manual check, never changed.
// The list is incomplete: a transaction whose type was re-picked during the
// buggy edit got a valid type back and can no longer be detected.
async function reportSwappedDates(type: unknown) {
  const docs = await Transaction.collection
    .find({ transaction_type: type })
    .toArray();
  for (const doc of docs) {
    console.log(
      `    transaction ${doc._id}: date ${formatDay(doc.date)}, check it (day and month may be swapped)`,
    );
  }
}

async function fixTransactionTypes() {
  const values: unknown[] =
    await Transaction.collection.distinct('transaction_type');
  const invalid = values.filter(
    (value) => !TRANSACTION_TYPES.includes(value as never),
  );
  if (invalid.length === 0) {
    console.log('✔ All transaction types are valid.');
    return;
  }
  for (const value of invalid) {
    const count = await Transaction.collection.countDocuments({
      transaction_type: value,
    });
    const target =
      typeof value === 'string' && LABEL_TO_TYPE[value.trim().toLowerCase()];
    if (target) {
      console.log(
        `• ${count} transaction(s) have type "${value}" instead of "${target}".`,
      );
    } else {
      console.log(
        `✘ ${count} transaction(s) have the unknown type ${JSON.stringify(value)}: fix them by hand.`,
      );
    }
    // Listed before the fix: once fixed, they can no longer be told apart.
    if (target) await reportSwappedDates(value);
    if (target && apply) {
      await Transaction.collection.updateMany(
        { transaction_type: value },
        { $set: { transaction_type: target } },
      );
      console.log(`  ✔ fixed: "${value}" -> "${target}".`);
    }
  }
  if (!apply) console.log('  (run with --apply to fix the types)');
}

async function reportMissingReferences() {
  const articleIds = new Set(
    (await Article.find({}, '_id').lean()).map((a) => String(a._id)),
  );
  const shopIds = new Set(
    (await Shop.find({}, '_id').lean()).map((s) => String(s._id)),
  );

  const orphanTransactions = (
    await Transaction.collection
      .find({}, { projection: { article: 1 } })
      .toArray()
  ).filter((t) => !articleIds.has(String(t.article)));
  const orphanArticles = (
    await Article.collection.find({}, { projection: { shop: 1 } }).toArray()
  ).filter((a) => !shopIds.has(String(a.shop)));

  if (orphanTransactions.length === 0 && orphanArticles.length === 0) {
    console.log(
      '✔ Every transaction and article points to an existing record.',
    );
    return;
  }
  // Reported only: deleting them would lose history, keeping them is harmless
  // (they are skipped by the stock and income computations).
  for (const t of orphanTransactions) {
    console.log(`• Transaction ${t._id} points to a deleted article.`);
  }
  for (const a of orphanArticles) {
    console.log(`• Article ${a._id} points to a deleted shop.`);
  }
}

async function reportBadQuantities() {
  const bad = await Transaction.collection
    .find({
      $or: [
        { quantity: { $not: { $type: 'number' } } },
        { quantity: { $lte: 0 } },
      ],
    })
    .toArray();
  if (bad.length === 0) {
    console.log('✔ All transaction quantities are positive numbers.');
    return;
  }
  for (const t of bad) {
    console.log(
      `• Transaction ${t._id} has quantity ${JSON.stringify(t.quantity)}.`,
    );
  }
}

async function main() {
  await connectDatabase(config.mongoUrl);
  console.log(
    `Database: ${mongoose.connection.name} (${apply ? 'APPLY' : 'report only'})\n`,
  );
  await fixTransactionTypes();
  await reportMissingReferences();
  await reportBadQuantities();
  await disconnectDatabase();
}

main().catch(async (err) => {
  console.error(err);
  await disconnectDatabase();
  process.exit(1);
});
