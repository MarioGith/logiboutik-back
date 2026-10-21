import mongoose from 'mongoose';

export async function connectDatabase(url: string): Promise<void> {
  mongoose.connection.on('error', (err) =>
    console.error('MongoDB connection error:', err),
  );
  await mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });
  console.log('Connected to MongoDB');
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
