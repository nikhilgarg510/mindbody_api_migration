# MindBody API Migration Project

This project provides both MindBody API v5 (SOAP) and v6 (REST) implementations, allowing for easy migration testing and comparison between the two API versions.

## Project Structure

```
mindbody_api_migration/
├── app.js                      # Main Express application
├── package.json               # Dependencies and scripts
├── .env.example               # Environment variables template
└── .env                       # Your actual environment variables (create this)
├── routes/
│   ├── v5-routes.js           # V5 SOAP API routes
│   └── v6-routes.js           # V6 REST API routes
├── mindbody_v5/               # MindBody V5 SOAP implementation
│   ├── index.js              # V5 main service file
│   ├── soap-request.js       # SOAP request handler
│   ├── mindbody-request-cleaners.js
│   └── mindbody-response-cleaners.js
└── mindbody_v6/               # MindBody V6 REST implementation
    ├── index.js              # V6 main service file
    └── mindbody-v6-service.js # V6 REST implementation
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file and fill in your MindBody API credentials:

```bash
cp .env.example .env
```

Edit the `.env` file with your actual values:

```env
# MindBody API Configuration
MINDBODY_SITE_ID=12345
MINDBODY_USERNAME=your_username
MINDBODY_PASSWORD=your_password
MINDBODY_API_KEY=your_v6_api_key

# Optional settings
MINDBODY_TEST_SITE_ID=-99
NODE_ENV=development
PORT=3000
```

### 3. Start the Server

```bash
npm start
# or for development
npm run dev
```

## API Endpoints

The server runs on `http://localhost:3000` by default.

### Health Check
- `GET /health` - Server health and service status

### V5 API (SOAP) - `/api/v5`
- `GET /api/v5/` - API information
- `GET /api/v5/clients` - Get clients
- `POST /api/v5/clients` - Add/update clients
- `GET /api/v5/clients/:clientId/services` - Get client services
- `PUT /api/v5/clients/services` - Update client services
- `GET /api/v5/services` - Get services
- `POST /api/v5/services/checkout` - Checkout shopping cart
- `GET /api/v5/classes` - Get classes
- `GET /api/v5/classes/schedules` - Get class schedules
- `GET /api/v5/classes/:classId/visits` - Get class visits
- `POST /api/v5/classes/add-clients` - Add clients to classes
- `POST /api/v5/classes/remove-clients` - Remove clients from classes
- `GET /api/v5/locations` - Get locations
- `GET /api/v5/sites` - Get sites

### V6 API (REST) - `/api/v6`
- `GET /api/v6/` - API information
- Same endpoint structure as V5 but using REST implementation

## Key Differences Between V5 and V6

### V5 (SOAP)
- Uses XML SOAP requests
- Requires username/password authentication for each request
- Synchronous request/response pattern
- Custom request/response cleaning and formatting

### V6 (REST)
- Uses JSON REST requests
- Token-based authentication (JWT)
- Automatic token refresh
- Direct HTTP status codes and JSON responses
- Better error handling and retry logic

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MINDBODY_SITE_ID` | Yes | Your MindBody site ID |
| `MINDBODY_USERNAME` | Yes | MindBody API username |
| `MINDBODY_PASSWORD` | Yes | MindBody API password |
| `MINDBODY_API_KEY` | Yes (V6 only) | MindBody V6 API key |
| `MINDBODY_TEST_SITE_ID` | No | Test site ID (defaults to -99) |
| `NODE_ENV` | No | Environment (development/production) |
| `PORT` | No | Server port (defaults to 3000) |

## Testing Interface

### Web-Based Testing Tool

Access the interactive testing interface at `http://localhost:3000` after starting the server. This tool provides:

- **API Selection**: Dropdown with all available MindBody API endpoints
- **Dynamic Forms**: Input fields that change based on the selected API
- **Parallel Testing**: Calls both V5 and V6 APIs simultaneously
- **Side-by-Side Comparison**: View responses from both versions in a clean, formatted display
- **Real-time Results**: See execution time, status, and detailed response data

### Features of the Testing Interface

1. **Smart Form Generation**: Each API endpoint shows only relevant input fields
2. **Parameter Validation**: Required fields are marked and validated
3. **Response Formatting**: JSON responses are syntax-highlighted and formatted
4. **Error Handling**: Clear error messages for both API versions
5. **Execution Timing**: Shows total time for parallel API calls
6. **Responsive Design**: Works on desktop and mobile devices

## Usage Examples

### Using the Web Interface
1. Open `http://localhost:3000` in your browser
2. Select an API from the dropdown (e.g., "GetClients")
3. Fill in the required parameters (e.g., email address)
4. Click "Compare APIs" to see V5 vs V6 results side by side

### Using Direct API Calls

#### Get Clients (V5)
```bash
curl "http://localhost:3000/api/v5/clients?email=test@example.com"
```

#### Get Clients (V6)
```bash
curl "http://localhost:3000/api/v6/clients?email=test@example.com"
```

#### Compare APIs Programmatically
```bash
curl -X POST "http://localhost:3000/api/compare" \
  -H "Content-Type: application/json" \
  -d '{
    "apiEndpoint": "GetClients",
    "params": { "email": "test@example.com" }
  }'
```

## Development Notes

- Both V5 and V6 services maintain the same interface for easy migration
- V6 includes automatic token management and retry logic
- All requests and responses are logged for debugging
- Error handling provides detailed information in development mode

## Migration Strategy

1. **Start with V5**: Use existing V5 implementation for current operations
2. **Test V6**: Run parallel tests with V6 endpoints using same data
3. **Compare Results**: Validate that V6 produces equivalent results to V5
4. **Gradual Migration**: Switch endpoints one by one from V5 to V6
5. **Full Migration**: Once confident, switch all traffic to V6

## Troubleshooting

### Service Initialization Errors
- Check that all required environment variables are set
- Verify your MindBody API credentials
- Ensure your API key has proper permissions for V6

### Authentication Errors
- V5: Check username/password credentials
- V6: Verify API key and ensure it's not expired

### Network Errors
- Check firewall settings
- Verify MindBody API endpoints are accessible
- Review timeout settings in service configurations
