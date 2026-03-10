import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.evbfdfwzsagsoskuhnwo:Cwbatis1994%40@aws-1-us-east-1.pooler.supabase.com:6543/postgres';

const client = new Client({
  connectionString,
});

async function setup() {
  try {
    await client.connect();
    console.log("Connected to PostgreSQL successfully.");

    await client.query(`
      CREATE TABLE IF NOT EXISTS reservoirs (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        capacity NUMERIC NOT NULL,
        current_liters NUMERIC NOT NULL,
        purchased_liters NUMERIC NOT NULL,
        purchase_price NUMERIC NOT NULL,
        sale_price NUMERIC NOT NULL,
        sold_liters NUMERIC NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Created 'reservoirs' table.");

    await client.query(`
      CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        client VARCHAR(255) NOT NULL,
        liters NUMERIC NOT NULL,
        fuel_type VARCHAR(255) NOT NULL,
        reservoir_id INTEGER REFERENCES reservoirs(id),
        payment VARCHAR(50) NOT NULL,
        price_per_liter NUMERIC NOT NULL,
        total NUMERIC NOT NULL,
        date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Created 'sales' table.");

    // Insert dummy data if table is empty
    const { rows } = await client.query('SELECT COUNT(*) FROM reservoirs');
    if (parseInt(rows[0].count) === 0) {
      console.log("Inserting initial data for reservoirs...");
      await client.query(`
        INSERT INTO reservoirs (name, capacity, current_liters, purchased_liters, purchase_price, sale_price, sold_liters) VALUES
        ('Gasolina Comum', 5000, 3200, 5000, 5.29, 6.50, 1800),
        ('Etanol', 3000, 1650, 3000, 3.89, 4.99, 1200),
        ('Diesel S-10', 6000, 4100, 6000, 5.79, 6.99, 1900);
      `);
      console.log("Initial reservoirs data inserted.");

      console.log("Inserting initial data for sales...");
      await client.query(`
        INSERT INTO sales (client, liters, fuel_type, reservoir_id, payment, price_per_liter, total) VALUES
        ('João Silva', 45, 'Gasolina Comum', 1, 'PIX', 6.50, 292.50),
        ('Maria Santos', 30, 'Etanol', 2, 'Dinheiro', 4.99, 149.70),
        ('Carlos Oliveira', 80, 'Diesel S-10', 3, 'Cartão Débito', 6.99, 559.20),
        ('Ana Costa', 25, 'Gasolina Comum', 1, 'PIX', 6.50, 162.50);
      `);
      console.log("Initial sales data inserted.");
    } else {
      console.log("Data already exists. Skipping initial data insertion.");
    }

  } catch (err) {
    console.error("Error setting up database:", err);
  } finally {
    await client.end();
  }
}

setup();
