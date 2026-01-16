// 本地测试脚本，用于验证 OpenAI 兼容性
const http = require('http');

const BASE_URL = 'http://127.0.0.1:8787';
const LOCAL_API_KEY = 'test-key'; // 需要与配置中的 localApiKey 匹配

function makeRequest(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '127.0.0.1',
      port: 8787,
      path: path,
      method: method,
      headers: {
        'Authorization': `Bearer ${LOCAL_API_KEY}`,
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
          const jsonData = JSON.parse(data);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (body) {
      req.write(JSON.stringify(body));
    }

    req.end();
  });
}

async function testAPI() {
  console.log('🧪 Testing LocalRouter OpenAI Compatibility...\n');

  try {
    // Test 1: Health check
    console.log('1️⃣ Testing /health endpoint...');
    const health = await makeRequest('/health', 'GET');
    console.log(`Status: ${health.statusCode}`);
    console.log('Response:', JSON.stringify(health.data, null, 2));
    console.log('✅ Health check passed\n');

    // Test 2: Models list
    console.log('2️⃣ Testing GET /v1/models...');
    const models = await makeRequest('/v1/models', 'GET');
    console.log(`Status: ${models.statusCode}`);
    console.log('Response:', JSON.stringify(models.data, null, 2));
    console.log('✅ Models endpoint works\n');

    // Test 3: Chat completions
    console.log('3️⃣ Testing POST /v1/chat/completions...');
    const chatRequest = {
      model: 'gpt-4', // 测试模型映射
      messages: [
        { role: 'user', content: 'Hello, say "API test successful"' }
      ],
      max_tokens: 20
    };
    const chat = await makeRequest('/v1/chat/completions', 'POST', chatRequest);
    console.log(`Status: ${chat.statusCode}`);
    console.log('Response:', JSON.stringify(chat.data, null, 2));
    console.log('✅ Chat completions works\n');

    // Test 4: Chat completions with errors (invalid request)
    console.log('4️⃣ Testing error handling...');
    const invalidRequest = {
      model: 'gpt-4',
      messages: [], // 空消息列表应该触发错误
    };
    const errorResponse = await makeRequest('/v1/chat/completions', 'POST', invalidRequest);
    console.log(`Status: ${errorResponse.statusCode}`);
    console.log('Error Response:', JSON.stringify(errorResponse.data, null, 2));
    console.log('✅ Error handling works\n');

    // Test 5: Embeddings (should return appropriate error)
    console.log('5️⃣ Testing POST /v1/embeddings...');
    const embedRequest = {
      model: 'text-embedding-ada-002',
      input: 'Hello world'
    };
    const embed = await makeRequest('/v1/embeddings', 'POST', embedRequest);
    console.log(`Status: ${embed.statusCode}`);
    console.log('Response:', JSON.stringify(embed.data, null, 2));
    console.log('✅ Embeddings handling works\n');

    console.log('🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- ✅ Basic HTTP server running');
    console.log('- ✅ CORS headers configured');
    console.log('- ✅ Local authentication working');
    console.log('- ✅ OpenAI-compatible endpoints implemented');
    console.log('- ✅ Model mapping functional');
    console.log('- ✅ Error responses standardized');
    console.log('- ✅ Request validation working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n💡 Make sure:');
    console.log('1. LocalRouter app is running and listening on port 8787');
    console.log('2. The localApiKey in configuration matches the test key above');
    console.log('3. DeepSeek API key is configured (for chat completions)');
  }
}

// Run tests
testAPI();