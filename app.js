// Load environment variables
require('dotenv').config()

const express = require('express')
const app = express()

// Import both MindBody services
const MindBodyV5Service = require('./mindbody_v5/index')
const MindBodyV6Service = require('./mindbody_v6/index')

// Global error handlers to prevent server crashes from unhandled promises
process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason)
    // Don't exit the process, just log the error
    console.error('⚠️  Server continuing despite unhandled rejection...')
})

process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error)
    console.error('⚠️  Server continuing despite uncaught exception...')
    // In production, you might want to gracefully shut down here
    // process.exit(1)
})

// Middleware
app.use(express.json())
app.use(express.static('public'))

// Environment variables validation
const requiredEnvVars = {
    MINDBODY_SITE_ID: process.env.MINDBODY_SITE_ID,
    MINDBODY_USERNAME: process.env.MINDBODY_USERNAME,
    MINDBODY_PASSWORD: process.env.MINDBODY_PASSWORD,
    MINDBODY_API_KEY: process.env.MINDBODY_API_KEY, // Required for v6
}

// Initialize services
let mindbodyV5, mindbodyV6

try {
    // Initialize V5 Service (SOAP)
    mindbodyV5 = MindBodyV5Service({
        site_id: requiredEnvVars.MINDBODY_SITE_ID,
        username: requiredEnvVars.MINDBODY_USERNAME,
        password: requiredEnvVars.MINDBODY_PASSWORD,
    })

    // Initialize V6 Service (REST) - Don't authenticate immediately
    mindbodyV6 = MindBodyV6Service({
        site_id: requiredEnvVars.MINDBODY_SITE_ID,
        username: requiredEnvVars.MINDBODY_USERNAME,
        password: requiredEnvVars.MINDBODY_PASSWORD,
        api_key: requiredEnvVars.MINDBODY_API_KEY,
    })

    console.log('✅ MindBody services initialized successfully')
    console.log('ℹ️  Note: V6 authentication will happen when first API call is made')
} catch (error) {
    console.error('❌ Failed to initialize MindBody services:', error.message)
}

// Serve the testing interface
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
})

// API comparison endpoint - calls V5, V6, or both based on version parameter
app.post('/api/compare', async (req, res) => {
    const { apiEndpoint, params, version = 'both' } = req.body

    // Check service availability based on requested version
    if (version === 'both' && (!mindbodyV5 || !mindbodyV6)) {
        return res.status(503).json({
            error: 'Services not initialized',
            message: 'Both V5 and V6 services must be initialized for comparison'
        })
    } else if (version === 'v5' && !mindbodyV5) {
        return res.status(503).json({
            error: 'V5 service not initialized',
            message: 'V5 (SOAP) service must be initialized'
        })
    } else if (version === 'v6' && !mindbodyV6) {
        return res.status(503).json({
            error: 'V6 service not initialized',
            message: 'V6 (REST) service must be initialized'
        })
    }

    // Set a timeout to ensure we always respond to the client
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 25 seconds')), 25000)
    })

    try {
        console.log(`🔍 API ${version.toUpperCase()} Request: ${apiEndpoint}`, params)
        const startTime = Date.now()

        // Extract site_id from params for dynamic service creation
        const site_id = params?.site_id || params?.siteId || params?.siteIds;
        // Create dynamic service instances based on site_id parameter
        const dynamicServices = createDynamicServices(site_id);

        console.log(`📋 Using site_id: ${site_id || 'default'} for ${version} call(s)`);

        // Race against timeout to ensure we always respond
        const result = await Promise.race([
            // Main API call logic based on version
            (async () => {
                let v5Result, v6Result;

                // Call APIs based on selected version
                if (version === 'both') {
                    // Call both APIs in parallel
                    [v5Result, v6Result] = await Promise.allSettled([
                        callMindbodyAPI(dynamicServices.v5, apiEndpoint, params),
                        callMindbodyAPI(dynamicServices.v6, apiEndpoint, params)
                    ]);
                } else if (version === 'v5') {
                    // Call only V5 API
                    [v5Result] = await Promise.allSettled([
                        callMindbodyAPI(dynamicServices.v5, apiEndpoint, params)
                    ]);
                } else if (version === 'v6') {
                    // Call only V6 API
                    [v6Result] = await Promise.allSettled([
                        callMindbodyAPI(dynamicServices.v6, apiEndpoint, params)
                    ]);
                }

                return { v5Result, v6Result }
            })(),
            timeoutPromise
        ])

        const { v5Result, v6Result } = result

        const endTime = Date.now()
        const totalTime = endTime - startTime

        // Build response object based on what was called
        const response = {
            comparison: {
                metadata: {
                    totalTime: `${totalTime}ms`,
                    timestamp: new Date().toISOString(),
                    apiEndpoint,
                    params,
                    version
                }
            }
        };

        // Add results based on version
        if (v5Result) {
            console.log(`📊 V5 API Result: ${v5Result.status}`, v5Result.status === 'fulfilled' ? '✅' : `❌ ${v5Result.reason?.message}`);
            response.comparison.v5 = {
                status: v5Result.status,
                data: v5Result.status === 'fulfilled' ? v5Result.value : null,
                error: v5Result.status === 'rejected' ? {
                    message: v5Result.reason.message,
                    type: v5Result.reason.name || 'Error',
                    stack: process.env.NODE_ENV === 'development' ? v5Result.reason.stack : undefined
                } : null
            };
        }

        if (v6Result) {
            console.log(`📊 V6 API Result: ${v6Result.status}`, v6Result.status === 'fulfilled' ? '✅' : `❌ ${v6Result.reason?.message}`);
            response.comparison.v6 = {
                status: v6Result.status,
                data: v6Result.status === 'fulfilled' ? v6Result.value : null,
                error: v6Result.status === 'rejected' ? {
                    message: v6Result.reason.message,
                    type: v6Result.reason.name || 'Error',
                    stack: process.env.NODE_ENV === 'development' ? v6Result.reason.stack : undefined
                } : null
            };
        }

        res.json(response)
    } catch (error) {
        console.error('🚨 API Comparison Error:', error.message)

        // Ensure we always send a response
        if (!res.headersSent) {
            res.status(500).json({
                error: 'Comparison failed',
                message: error.message,
                timestamp: new Date().toISOString()
            })
        }
    }
})

// Helper function to call MindBody API methods dynamically
async function callMindbodyAPI(service, endpoint, params) {
    if (typeof service[endpoint] !== 'function') {
        throw new Error(`API endpoint '${endpoint}' not found`)
    }
    return await service[endpoint](params)
}

// Helper function to create dynamic service instances based on site_id
function createDynamicServices(site_id = null) {
    const effectiveSiteId = site_id || requiredEnvVars.MINDBODY_SITE_ID;

    try {
        const dynamicV5 = MindBodyV5Service({
            site_id: effectiveSiteId,
            username: requiredEnvVars.MINDBODY_USERNAME,
            password: requiredEnvVars.MINDBODY_PASSWORD,
        });

        const dynamicV6 = MindBodyV6Service({
            site_id: effectiveSiteId,
            username: requiredEnvVars.MINDBODY_USERNAME,
            password: requiredEnvVars.MINDBODY_PASSWORD,
            api_key: requiredEnvVars.MINDBODY_API_KEY,
        });

        return { v5: dynamicV5, v6: dynamicV6 };
    } catch (error) {
        console.error('❌ Failed to create dynamic MindBody services:', error.message);
        // Fallback to default services
        return { v5: mindbodyV5, v6: mindbodyV6 };
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        services: {
            v5: !!mindbodyV5 ? 'initialized' : 'failed',
            v6: !!mindbodyV6 ? 'initialized' : 'failed'
        }
    })
})

// Debug endpoint for testing connectivity
app.get('/debug', (req, res) => {
    console.log('🔍 Debug endpoint called');
    res.json({
        message: 'Debug endpoint working',
        timestamp: new Date().toISOString(),
        env: {
            NODE_ENV: process.env.NODE_ENV || 'development',
            PORT: process.env.PORT || 3000
        }
    })
})

// MindBody V5 Routes (SOAP API)
app.use('/api/v5', require('./routes/v5-routes'))

// MindBody V6 Routes (REST API)
app.use('/api/v6', require('./routes/v6-routes'))

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('❌ Application Error:', error)
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    })
})

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.originalUrl} not found`
    })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`🚀 MindBody API Migration Server running on port ${PORT}`)
    console.log(`🧪 Testing Interface: http://localhost:${PORT}`)
    console.log(`📄 Health check: http://localhost:${PORT}/health`)
    console.log(`🔗 V5 API: http://localhost:${PORT}/api/v5`)
    console.log(`🔗 V6 API: http://localhost:${PORT}/api/v6`)
})

module.exports = app
