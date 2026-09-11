import { drizzle } from 'drizzle-orm/neon-http';
import { relations } from './relations';

const db = drizzle(process.env.DATABASE_URL!, { relations });

export { db };