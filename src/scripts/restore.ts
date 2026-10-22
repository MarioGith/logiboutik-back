// Restores a backup file (downloaded with the "Sauvegarder les données"
// button) into an EMPTY database. It refuses to touch a database that
// already contains data, so it can never overwrite anything.
// If a restore stops halfway, drop the target database before trying again.
//
//   pnpm restore path/to/logiboutik-backup.json
import fs from 'fs';
import mongoose from 'mongoose';
import { config } from '../config';
import { connectDatabase, disconnectDatabase } from '../database';

const ID_FIELDS = ['_id', 'shop', 'article'];
const DATE_FIELDS = ['date'];

// JSON has no ObjectId or Date type: the backup stores them as strings.
// Convert them back so the restored data is identical to the original.
export function reviveDocument(doc: Record<string, unknown>) {
  const revived: Record<string, unknown> = { ...doc };
  for (const field of ID_FIELDS) {
    const value = revived[field];
    if (typeof value === 'string' && /^[a-f0-9]{24}$/i.test(value)) {
      revived[field] = new mongoose.Types.ObjectId(value);
    }
  }
  for (const field of DATE_FIELDS) {
    if (typeof revived[field] === 'string') {
      revived[field] = new Date(revived[field] as string);
    }
  }
  return revived;
}

async function main() {
  const file = process.argv[2];
  if (!file) throw new Error('Usage: pnpm restore <backup.json>');
  const backup = JSON.parse(fs.readFileSync(file, 'utf8'));
  const data: Record<string, Record<string, unknown>[]> = backup.data;
  if (!data) throw new Error(`${file} is not a Logiboutik backup`);

  await connectDatabase(config.mongoUrl);
  const db = mongoose.connection.db;

  for (const name of Object.keys(data)) {
    if ((await db.collection(name).countDocuments()) > 0) {
      throw new Error(
        `Collection "${name}" is not empty: restore only into an empty database.`,
      );
    }
  }
  for (const [name, docs] of Object.entries(data)) {
    if (docs.length > 0) {
      await db.collection(name).insertMany(docs.map(reviveDocument));
    }
    console.log(`✔ ${name}: ${docs.length} document(s) restored`);
  }
  await disconnectDatabase();
}

if (require.main === module) {
  main().catch(async (err) => {
    console.error(err.message ?? err);
    await disconnectDatabase();
    process.exit(1);
  });
}
