import pkg from 'pg';
import bcrypt from 'bcrypt';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.evbfdfwzsagsoskuhnwo:Cwbatis1994%40@aws-1-us-east-1.pooler.supabase.com:6543/postgres';

const client = new Client({ connectionString });

async function setup() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL successfully.");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Created 'users' table.");

    const email = 'admin@admin.com';
    const password = 'admin'; // A senha que vou fornecer
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Upsert admin user
    const { rows } = await client.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      await client.query('INSERT INTO users (email, password_hash) VALUES ($1, $2)', [email, passwordHash]);
      console.log(`User ${email} created successfully.`);
    } else {
      await client.query('UPDATE users SET password_hash = $2 WHERE email = $1', [email, passwordHash]);
      console.log(`User ${email} updated successfully.`);
    }
  } catch (err) {
    console.error("Error setting up users:", err);
  } finally {
    await client.end();
  }
}

setup();
