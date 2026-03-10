import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.evbfdfwzsagsoskuhnwo:Cwbatis1994%40@aws-1-us-east-1.pooler.supabase.com:6543/postgres';

const client = new Client({ connectionString });

async function check() {
  try {
    await client.connect();
    const { rows } = await client.query('SELECT id, email FROM users');
    console.log("Users in DB:", rows);
  } catch (err) {
    console.error(err);
  } finally {
    await client.end();
  }
}

check();
