import mongoose from 'mongoose';

interface IDatabase {
  connect: () => Promise<void>;
  db: mongoose.Connection;
}

export const database: IDatabase = {
  connect: function (): Promise<void> {
    throw new Error('Function not implemented.');
  },
  db: mongoose.connection,
};

database.connect = async () => {
  mongoose.connect('mongodb://mongo/boutikdac');
  database.db = mongoose.connection;
  database.db.on(
    'error',
    console.error.bind(console, 'Erreur lors de la connexion')
  );
  database.db.once('open', () => {
    console.log('Connexion à la base OK');
  });
};
