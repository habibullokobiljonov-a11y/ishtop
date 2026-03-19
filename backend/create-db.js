const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '123456',
  database: 'postgres', // Connect to default postgres db first
});

async function createDatabase() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL...');

    // Check if database exists
    const result = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = 'ishtop'`
    );

    if (result.rows.length === 0) {
      await client.query('CREATE DATABASE ishtop');
      console.log('✅ Database "ishtop" created successfully');
    } else {
      console.log('✅ Database "ishtop" already exists');
    }

    await client.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

createDatabase();
