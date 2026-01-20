import http from 'http';

// Simple test function
async function quickTest() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/providers',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          console.log('✅ API Response:', result.length ? `${result.length} providers found` : 'No providers');
          resolve(result);
        } catch (e) {
          console.log('📝 Raw response:', data);
          resolve(data);
        }
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error:', error.message);
      reject(error);
    });

    req.setTimeout(5000, () => {
      console.error('❌ Request timeout');
      reject(new Error('Timeout'));
    });

    req.end();
  });
}

quickTest().then(() => process.exit(0)).catch(() => process.exit(1));