import mongoose from 'mongoose';

interface IBackupHandler {
  getBackup: (req: any, res: any) => Promise<void>;
}

export const backupHandler: IBackupHandler = {
  getBackup: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
};

// HTTP

// Dumps every collection of the connected database to a single JSON payload.
// Collections are read generically so the backup stays complete even if new
// collections are added later.
backupHandler.getBackup = async (req, res) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.collections();

    const data: Record<string, any[]> = {};
    await Promise.all(
      collections.map(async (collection) => {
        data[collection.collectionName] = await collection.find({}).toArray();
      })
    );

    res.status(200).json({
      meta: {
        database: db.databaseName,
        exportedAt: new Date().toISOString(),
        collections: Object.keys(data),
      },
      data,
    });
  } catch (err) {
    console.error('Error creating backup:', err);
    res.status(500).send({ message: 'Backup failed' });
  }
};
