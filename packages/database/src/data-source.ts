import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './entities/User';
import { Category } from './entities/Category';
import { Product } from './entities/Product';
import { ClickTracking } from './entities/ClickTracking';

const databaseUrl = process.env.DATABASE_URL;

export const AppDataSource = new DataSource(
  databaseUrl
    ? {
        type: 'postgres',
        url: databaseUrl,
        ssl: databaseUrl.includes('supabase') || process.env.DB_SSL === 'true'
          ? { rejectUnauthorized: false }
          : false,
        synchronize: true, // Auto synchronize schema in dev/staging
        logging: process.env.NODE_ENV === 'development',
        entities: [User, Category, Product, ClickTracking],
        subscribers: [],
        migrations: [],
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        username: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'tiktok_catalog',
        synchronize: true,
        logging: process.env.NODE_ENV === 'development',
        entities: [User, Category, Product, ClickTracking],
        subscribers: [],
        migrations: [],
      }
);

let initializedPromise: Promise<DataSource> | null = null;

export async function getDataSource(): Promise<DataSource> {
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }
  if (!initializedPromise) {
    initializedPromise = AppDataSource.initialize();
  }
  return initializedPromise;
}
