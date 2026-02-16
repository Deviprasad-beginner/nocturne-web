import 'dotenv/config';
import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
    if (!process.env.DATABASE_URL) {
        console.error('❌ DATABASE_URL is not set');
        process.exit(1);
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    });

    try {
        console.log('📖 Reading migration file...');
        const migrationSQL = fs.readFileSync(
            path.join(__dirname, 'migration_read_card.sql'),
            'utf-8'
        );

        console.log('🔄 Running Read Card migration...');
        await pool.query(migrationSQL);

        console.log('✅ Read Card migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

runMigration();
