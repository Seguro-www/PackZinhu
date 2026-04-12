import fetch from 'node-fetch';

async function test() {
  try {
    const response = await fetch('http://localhost:3000/api/create-mercadopago-preference', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        serviceId: 'test',
        serviceTitle: 'Test Service',
        amount: 10,
        sellerId: 'seller123',
        buyerId: 'buyer123',
        buyerName: 'Test Buyer'
      })
    });
    const text = await response.text();
    console.log('Status:', response.status);
    console.log('Response:', text);
  } catch (e) {
    console.error(e);
  }
}

test();
