import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import pkg from 'pg';
const { Client } = pkg;

const connectionString = 'postgresql://postgres.evbfdfwzsagsoskuhnwo:Cwbatis1994%40@aws-1-us-east-1.pooler.supabase.com:6543/postgres';

const app = express();
app.use(cors());
app.use(express.json());

const client = new Client({ connectionString });
client.connect().then(() => console.log('Connected to Supabase DB')).catch(console.error);

// POST /api/login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    console.log(`Login attempt for email: "${email}"`);
    console.log(`Normalized email: "${normalizedEmail}"`);
    console.log(`Length of normalized email: ${normalizedEmail.length}`);
    for (let i = 0; i < normalizedEmail.length; i++) {
       console.log(`Char ${i}: ${normalizedEmail.charCodeAt(i)}`);
    }

    const { rows } = await client.query('SELECT * FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
    if (rows.length === 0) {
      console.log('User not found in DB');
      return res.status(401).json({ error: "Credenciais inválidas (usuário)" });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password.trim(), user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenciais inválidas (senha)" });
    }

    res.json({ message: "Login realizado com sucesso", token: "fake-jwt-token", user: { email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// GET /api/reservoirs
app.get('/api/reservoirs', async (req, res) => {
  try {
    const { rows } = await client.query('SELECT * FROM reservoirs ORDER BY id ASC');
    const formatted = rows.map(r => ({
      id: r.id,
      name: r.name,
      capacity: Number(r.capacity),
      currentLiters: Number(r.current_liters),
      purchasedLiters: Number(r.purchased_liters),
      purchasePrice: Number(r.purchase_price),
      salePrice: Number(r.sale_price),
      soldLiters: Number(r.sold_liters),
      createdAt: r.created_at
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reservoirs
app.post('/api/reservoirs', async (req, res) => {
  const { name, capacity, currentLiters, purchasedLiters, purchasePrice, salePrice } = req.body;
  try {
    const { rows } = await client.query(`
      INSERT INTO reservoirs (name, capacity, current_liters, purchased_liters, purchase_price, sale_price, sold_liters)
      VALUES ($1, $2, $3, $4, $5, $6, 0)
      RETURNING *
    `, [name, capacity, currentLiters, purchasedLiters, purchasePrice, salePrice]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/sales
app.get('/api/sales', async (req, res) => {
  try {
    const { rows } = await client.query('SELECT * FROM sales ORDER BY date DESC');
    const formatted = rows.map(r => ({
      id: r.id,
      client: r.client,
      liters: Number(r.liters),
      fuelType: r.fuel_type,
      reservoirId: r.reservoir_id,
      payment: r.payment,
      pricePerLiter: Number(r.price_per_liter),
      total: Number(r.total),
      date: r.date
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/sales
app.post('/api/sales', async (req, res) => {
  const { client: clientName, liters, fuelType, reservoirId, payment, pricePerLiter, total } = req.body;
  try {
    await client.query('BEGIN');
    
    const { rows } = await client.query(`
      INSERT INTO sales (client, liters, fuel_type, reservoir_id, payment, price_per_liter, total)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `, [clientName, liters, fuelType, reservoirId, payment, pricePerLiter, total]);
    
    await client.query(`
      UPDATE reservoirs 
      SET current_liters = current_liters - $1, sold_liters = sold_liters + $1 
      WHERE id = $2
    `, [liters, reservoirId]);

    await client.query('COMMIT');
    res.json(rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend API running on port ${PORT} (0.0.0.0)`);
});
