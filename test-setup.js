#!/usr/bin/env node

// Test script to verify MindBody API setup
require('dotenv').config()

const requiredEnvVars = [
    'MINDBODY_SITE_ID',
    'MINDBODY_USERNAME',
    'MINDBODY_PASSWORD',
    'MINDBODY_API_KEY'
]

const optionalV5Vars = [
    'MINDBODY_SOURCE_NAME',
    'MINDBODY_SOURCE_PASSWORD'
]

console.log('🧪 MindBody API Setup Verification\n')

// Check environment variables
console.log('📋 Environment Variables:')
let missingVars = []

requiredEnvVars.forEach(varName => {
    const value = process.env[varName]
    if (value) {
        console.log(`✅ ${varName}: ${value.length > 10 ? value.substring(0, 10) + '...' : value}`)
    } else {
        console.log(`❌ ${varName}: Missing`)
        missingVars.push(varName)
    }
})

// Check optional V5 variables
console.log('\n📋 V5 Source Credentials (Optional):')
let missingV5Vars = []

optionalV5Vars.forEach(varName => {
    const value = process.env[varName]
    if (value) {
        console.log(`✅ ${varName}: ${value.length > 10 ? value.substring(0, 10) + '...' : value}`)
    } else {
        console.log(`⚠️  ${varName}: Missing (V5 API will not work)`)
        missingV5Vars.push(varName)
    }
})

if (missingVars.length > 0) {
    console.log(`\n❌ Missing required environment variables: ${missingVars.join(', ')}`)
    console.log('Please check your .env file and ensure all required variables are set.')
    process.exit(1)
}

if (missingV5Vars.length > 0) {
    console.log(`\n⚠️  Missing V5 Source Credentials: ${missingV5Vars.join(', ')}`)
    console.log('V5 SOAP API will not work. Contact MindBody support to obtain Source Credentials.')
    console.log('You can still test V6 REST API without these credentials.')
}// Test service initialization
console.log('\n🔧 Testing Service Initialization:')

try {
    const MindBodyV5Service = require('./mindbody_v5/index')
    const v5Service = MindBodyV5Service({
        site_id: process.env.MINDBODY_SITE_ID,
        username: process.env.MINDBODY_USERNAME,
        password: process.env.MINDBODY_PASSWORD,
    })
    console.log('✅ V5 Service: Initialized successfully')
} catch (error) {
    console.log('❌ V5 Service: Failed to initialize -', error.message)
}

try {
    const MindBodyV6Service = require('./mindbody_v6/index')
    const v6Service = MindBodyV6Service({
        site_id: process.env.MINDBODY_SITE_ID,
        username: process.env.MINDBODY_USERNAME,
        password: process.env.MINDBODY_PASSWORD,
        api_key: process.env.MINDBODY_API_KEY,
    })
    console.log('✅ V6 Service: Initialized successfully')
} catch (error) {
    console.log('❌ V6 Service: Failed to initialize -', error.message)
}

console.log('\n🚀 Setup verification complete!')
console.log('You can now start the server with: npm start')
console.log('Or run: node app.js')
