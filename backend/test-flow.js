const http = require('http');

const request = (method, path, body, token) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({
            statusCode: res.statusCode,
            body: data ? JSON.parse(data) : null
          });
        } catch (err) {
          resolve({
            statusCode: res.statusCode,
            body: data
          });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

async function runTests() {
  console.log('--- STARTING BACKEND FLOW TESTS ---');

  // 1. Get products
  console.log('\n1. Fetching products list...');
  const productsRes = await request('GET', '/api/products');
  console.log('Status:', productsRes.statusCode);
  console.log('Product count:', productsRes.body.length);
  if (productsRes.statusCode !== 200 || productsRes.body.length === 0) {
    console.error('Products fetch failed!');
    process.exit(1);
  }

  // 2. Register user
  console.log('\n2. Registering new user...');
  const testUser = {
    username: 'testuser_' + Date.now(),
    email: 'test_' + Date.now() + '@example.com',
    password: 'password123'
  };
  const registerRes = await request('POST', '/api/auth/register', testUser);
  console.log('Status:', registerRes.statusCode);
  console.log('Body:', registerRes.body);
  if (registerRes.statusCode !== 201 || !registerRes.body.token) {
    console.error('Registration failed!');
    process.exit(1);
  }

  const token = registerRes.body.token;

  // 3. Get profile
  console.log('\n3. Fetching user profile...');
  const meRes = await request('GET', '/api/auth/me', null, token);
  console.log('Status:', meRes.statusCode);
  console.log('Body:', meRes.body);
  if (meRes.statusCode !== 200 || meRes.body.username !== testUser.username) {
    console.error('Profile fetch failed!');
    process.exit(1);
  }

  // 4. Place order
  console.log('\n4. Placing order for product ID 1 (Qty 2) and ID 2 (Qty 1)...');
  const orderData = {
    shipping_address: '123 E-Commerce Way, Suite 404, Tech City',
    items: [
      { product_id: 1, quantity: 2 },
      { product_id: 2, quantity: 1 }
    ]
  };
  const orderRes = await request('POST', '/api/orders', orderData, token);
  console.log('Status:', orderRes.statusCode);
  console.log('Body:', orderRes.body);
  if (orderRes.statusCode !== 201 || !orderRes.body.orderId) {
    console.error('Order placement failed!');
    process.exit(1);
  }

  // 5. Fetch orders history
  console.log('\n5. Fetching order history...');
  const historyRes = await request('GET', '/api/orders', null, token);
  console.log('Status:', historyRes.statusCode);
  console.log('Orders found:', historyRes.body.length);
  console.log('Order items sample:', historyRes.body[0].items);
  if (historyRes.statusCode !== 200 || historyRes.body.length === 0) {
    console.error('Order history fetch failed!');
    process.exit(1);
  }

  console.log('\n--- ALL BACKEND FLOW TESTS PASSED SUCCESSFULLY ---');
  process.exit(0);
}

runTests().catch(err => {
  console.error('Test run crashed:', err);
  process.exit(1);
});
