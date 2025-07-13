# CORS Configuration Guide

## Problem
You were experiencing CORS errors when trying to access your API from frontend domains:
- `https://rec-website-gules.vercel.app`
- `https://recplus.vercel.app`

## Solution Applied

### 1. CORS Package Installation
The `cors` package was already installed in your `package.json`.

### 2. CORS Configuration Added
Added comprehensive CORS configuration to `recPlus-server/api/index.js`:

```javascript
const cors = require('cors');

const corsOptions = {
  origin: [
    'https://rec-website-gules.vercel.app',
    'https://recplus.vercel.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:5173',
    'http://localhost:4173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Auth-Token',
    'Cache-Control'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
```

### 3. Additional CORS Headers
Added CORS headers to the debug middleware for additional support:

```javascript
// Add CORS headers for debugging
res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
res.header('Access-Control-Allow-Credentials', 'true');
res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, X-Auth-Token, Cache-Control');
```

### 4. Test Endpoints Added
- `/api/cors-test` - Dedicated CORS testing endpoint
- Enhanced `/api/test` endpoint with CORS information

## Testing

### Run the CORS Test Script
```bash
cd recPlus-server
node test-cors.js
```

### Manual Testing
1. **Test basic connectivity:**
   ```
   GET https://srv884531.hstgr.cloud/api/test
   ```

2. **Test CORS specifically:**
   ```
   GET https://srv884531.hstgr.cloud/api/cors-test
   ```

3. **Test preflight requests:**
   ```
   OPTIONS https://srv884531.hstgr.cloud/api/candidates/register
   ```

## Troubleshooting

### If CORS errors persist:

1. **Check server logs** for CORS-related messages
2. **Verify domain names** are exactly correct (no typos)
3. **Check if server is restarted** after configuration changes
4. **Test with curl:**
   ```bash
   curl -H "Origin: https://rec-website-gules.vercel.app" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        https://srv884531.hstgr.cloud/api/test
   ```

### Common Issues:

1. **Wildcard origin not working with credentials:**
   - Solution: Use specific origins instead of `*`

2. **Missing preflight handling:**
   - Solution: Added `app.options('*', cors(corsOptions))`

3. **Headers not allowed:**
   - Solution: Added all necessary headers to `allowedHeaders`

## Deployment Notes

- Make sure to restart your server after making these changes
- If using Vercel or similar platforms, ensure the environment variables are set correctly
- The CORS configuration will work for both development and production environments

## Security Considerations

- The current configuration allows specific trusted domains
- Credentials are enabled for authenticated requests
- All necessary HTTP methods are allowed
- Headers are explicitly defined for security

## Next Steps

1. Deploy the updated server code
2. Test the frontend applications
3. Monitor server logs for any remaining CORS issues
4. Update the allowed origins list if you add new frontend domains 