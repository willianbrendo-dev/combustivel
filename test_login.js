import fetch from 'node-fetch';

async function test() {
  const res = await fetch('http://localhost:3001/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@admin.com', password: 'admin' })
  });
  console.log(res.status, await res.json());
}
test();
