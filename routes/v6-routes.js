const express = require('express')
const router = express.Router()
const MindBodyV6Service = require('../mindbody_v6/index')

// Initialize V6 service
let mindbodyV6
try {
    mindbodyV6 = MindBodyV6Service({
        site_id: process.env.MINDBODY_SITE_ID,
        username: process.env.MINDBODY_USERNAME,
        password: process.env.MINDBODY_PASSWORD,
        api_key: process.env.MINDBODY_API_KEY,
    })
} catch (error) {
    console.error('❌ Failed to initialize MindBody V6 service:', error.message)
}

// Middleware to check if service is initialized
const checkService = (req, res, next) => {
    if (!mindbodyV6) {
        return res.status(503).json({
            error: 'Service Unavailable',
            message: 'MindBody V6 service not initialized. Check environment variables.'
        })
    }
    next()
}

// V6 API Info
router.get('/', (req, res) => {
    try {
        res.json({
            version: 'v6',
            type: 'REST',
            description: 'MindBody API v6 REST-based endpoints',
            endpoints: {
                clients: '/clients',
                services: '/services',
                classes: '/classes',
                locations: '/locations',
                sites: '/sites'
            }
        })
    } catch (error) {
        res.status(500).json({ error: 'Failed to get API info', message: error.message })
    }
})

// Client endpoints
router.get('/clients', checkService, async (req, res) => {
    try {
        const { email, client_ids, search_text } = req.query
        const result = await mindbodyV6.GetClients({ email, client_ids, search_text })
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to get clients', message: error.message })
    }
})

router.post('/clients', checkService, async (req, res) => {
    try {
        const result = await mindbodyV6.AddOrUpdateClients(req.body)
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to add/update client', message: error.message })
    }
})

router.get('/clients/:clientId/services', checkService, async (req, res) => {
    try {
        const { clientId } = req.params
        const { class_id } = req.query
        const result = await mindbodyV6.GetClientServices({ client_id: clientId, class_id })
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to get client services', message: error.message })
    }
})

router.put('/clients/services', checkService, async (req, res) => {
    try {
        const result = await mindbodyV6.UpdateClientServices(req.body)
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to update client services', message: error.message })
    }
})

// Service endpoints
router.get('/services', checkService, async (req, res) => {
    try {
        const { class_id } = req.query
        const result = await mindbodyV6.GetServices({ class_id })
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to get services', message: error.message })
    }
})

router.post('/services/checkout', checkService, async (req, res) => {
    try {
        const result = await mindbodyV6.CheckoutShoppingCart(req.body)
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to checkout', message: error.message })
    }
})

// Class endpoints
router.get('/classes', checkService, async (req, res) => {
    try {
        const { location_id, class_id, start_date, end_date } = req.query
        const result = await mindbodyV6.GetClasses({ location_id, class_id, start_date, end_date })
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to get classes', message: error.message })
    }
})

router.get('/classes/schedules', checkService, async (req, res) => {
    try {
        const { location_id, start_date, end_date } = req.query
        const result = await mindbodyV6.GetClassSchedules({ location_id, start_date, end_date })
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to get class schedules', message: error.message })
    }
})

router.get('/classes/:classId/visits', checkService, async (req, res) => {
    try {
        const { classId } = req.params
        const result = await mindbodyV6.GetClassVisits({ class_id: classId })
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to get class visits', message: error.message })
    }
})

router.post('/classes/add-clients', checkService, async (req, res) => {
    try {
        const result = await mindbodyV6.AddClientsToClasses(req.body)
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to add clients to class', message: error.message })
    }
})

router.post('/classes/remove-clients', checkService, async (req, res) => {
    try {
        const result = await mindbodyV6.RemoveClientsFromClasses(req.body)
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove clients from class', message: error.message })
    }
})

// Location and Site endpoints
router.get('/locations', checkService, async (req, res) => {
    try {
        const result = await mindbodyV6.GetLocations()
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to get locations', message: error.message })
    }
})

router.get('/sites', checkService, async (req, res) => {
    try {
        const result = await mindbodyV6.GetSites()
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to get sites', message: error.message })
    }
})

// Helper endpoints
router.post('/services/find', checkService, async (req, res) => {
    try {
        const { params, matchFunction } = req.body
        // Note: This would need the matchFunction to be passed properly
        const result = await mindbodyV6.GetService(params, eval(matchFunction))
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to find service', message: error.message })
    }
})

router.post('/clients/services/void', checkService, async (req, res) => {
    try {
        const result = await mindbodyV6.VoidClientService(req.body)
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to void client service', message: error.message })
    }
})

module.exports = router
