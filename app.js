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

// API comparison endpoint - calls both V5 and V6 in parallel
app.post('/api/compare', async (req, res) => {
    const { apiEndpoint, params } = req.body

    if (!mindbodyV5 || !mindbodyV6) {
        return res.status(503).json({
            error: 'Services not initialized',
            message: 'Both V5 and V6 services must be initialized'
        })
    }

    // Set a timeout to ensure we always respond to the client
    const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout after 25 seconds')), 25000)
    })

    try {
        console.log(`🔍 API Comparison Request: ${apiEndpoint}`, params)
        const startTime = Date.now()

        // Race against timeout to ensure we always respond
        const result = await Promise.race([
            // Main comparison logic
            (async () => {
                // Call both APIs in parallel with individual timeouts
                const [v5Result, v6Result] = await Promise.allSettled([
                    callMindbodyAPI(mindbodyV5, apiEndpoint, params),
                    callMindbodyAPI(mindbodyV6, apiEndpoint, params)
                ])

                return { v5Result, v6Result }
            })(),
            timeoutPromise
        ])

        const { v5Result, v6Result } = result

        console.log(v5Result)
        const endTime = Date.now()
        const totalTime = endTime - startTime

        console.log(`📊 API Results:`)
        console.log(`   V5: ${v5Result.status}`, v5Result.status === 'fulfilled' ? '✅' : `❌ ${v5Result.reason?.message}`)
        console.log(`   V6: ${v6Result.status}`, v6Result.status === 'fulfilled' ? '✅' : `❌ ${v6Result.reason?.message}`)

        res.json({
            comparison: {
                v5: {
                    status: v5Result.status,
                    data: v5Result.status === 'fulfilled' ? v5Result.value : null,
                    error: v5Result.status === 'rejected' ? {
                        message: v5Result.reason.message,
                        type: v5Result.reason.name || 'Error',
                        stack: process.env.NODE_ENV === 'development' ? v5Result.reason.stack : undefined
                    } : null
                },
                v6: {
                    status: v6Result.status,
                    data: v6Result.status === 'fulfilled' ? v6Result.value : null,
                    error: v6Result.status === 'rejected' ? {
                        message: v6Result.reason.message,
                        type: v6Result.reason.name || 'Error',
                        stack: process.env.NODE_ENV === 'development' ? v6Result.reason.stack : undefined
                    } : null
                },
                metadata: {
                    totalTime: `${totalTime}ms`,
                    timestamp: new Date().toISOString(),
                    apiEndpoint,
                    params
                }
            }
        })
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
