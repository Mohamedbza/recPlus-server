const https = require('https');
const http = require('http');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };
    
    const req = client.request(requestOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

async function testCORS() {
  const baseUrl = 'https://srv884531.hstgr.cloud';
  
  console.log('🧪 Testing CORS configuration...\n');
  
  // Test 1: Basic GET request
  try {
    console.log('1️⃣ Testing GET /api/test...');
    const response = await makeRequest(`${baseUrl}/api/test`);
    console.log('✅ Status:', response.status);
    console.log('🔗 Allow-Origin:', response.headers['access-control-allow-origin']);
    console.log('🔗 Allow-Methods:', response.headers['access-control-allow-methods']);
    console.log('📄 Response:', response.data.substring(0, 200) + '...');
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 2: CORS test endpoint
  try {
    console.log('2️⃣ Testing GET /api/cors-test...');
    const response = await makeRequest(`${baseUrl}/api/cors-test`);
    console.log('✅ Status:', response.status);
    console.log('🔗 Allow-Origin:', response.headers['access-control-allow-origin']);
    console.log('📄 Response:', response.data.substring(0, 200) + '...');
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 3: OPTIONS preflight request
  try {
    console.log('3️⃣ Testing OPTIONS preflight...');
    const response = await makeRequest(`${baseUrl}/api/test`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://rec-website-gules.vercel.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type, Authorization'
      }
    });
    console.log('✅ Preflight Status:', response.status);
    console.log('🔗 Allow-Origin:', response.headers['access-control-allow-origin']);
    console.log('🔗 Allow-Methods:', response.headers['access-control-allow-methods']);
    console.log('🔗 Allow-Headers:', response.headers['access-control-allow-headers']);
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Test 4: POST request (like registration)
  try {
    console.log('4️⃣ Testing POST /api/candidates/register...');
    const response = await makeRequest(`${baseUrl}/api/candidates/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://rec-website-gules.vercel.app'
      },
      body: JSON.stringify({
        test: true,
        message: 'CORS test request'
      })
    });
    console.log('✅ POST Status:', response.status);
    console.log('🔗 Allow-Origin:', response.headers['access-control-allow-origin']);
    console.log('📄 Response:', response.data.substring(0, 200) + '...');
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
}

testCORS().catch(console.error); 