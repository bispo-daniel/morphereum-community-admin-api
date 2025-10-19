import mongoose from 'mongoose';

import { env } from '@/config/index.js';

export const connectToMongoDb = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_CONNECTION_STRING, {
      dbName: env.MONGODB_DB_NAME,
    });

    console.log('[mongo-db] --> Connected.');
  } catch (error) {
    console.error('[mongo-db] --> Error connecting to MongoDB: ', error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log('[mongo-db] --> Disconnected.');
});
