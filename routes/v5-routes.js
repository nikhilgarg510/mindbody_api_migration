const express = require('express')
const router = express.Router()
const MindBodyV5Service = require('../mindbody_v5/index')

// Initialize default V5 service
let defaultMindbodyV5
try {
    defaultMindbodyV5 = MindBodyV5Service({
        site_id: process.env.MINDBODY_SITE_ID,
        username: process.env.MINDBODY_USERNAME,
        password: process.env.MINDBODY_PASSWORD,
    })
} catch (error) {
    console.error('❌ Failed to initialize default MindBody V5 service:', error.message)
}

// Helper function to get V5 service instance (either with custom site_id or default)
const getMindbodyV5Service = (site_id = null) => {
    // If site_id is provided and different from default, create new instance
    if (site_id && site_id !== process.env.MINDBODY_SITE_ID) {
        try {
            return MindBodyV5Service({
                site_id: site_id,
                username: process.env.MINDBODY_USERNAME,
                password: process.env.MINDBODY_PASSWORD,
            })
        } catch (error) {
            console.error('❌ Failed to initialize custom MindBody V5 service:', error.message)
            return defaultMindbodyV5
        }
    }
    return defaultMindbodyV5
}

// Middleware to check if service is initialized
const checkService = (req, res, next) => {
    if (!defaultMindbodyV5) {
        return res.status(503).json({
            error: 'Service Unavailable',
            message: 'MindBody V5 service not initialized. Check environment variables.'
        })
    }
    next()
}

// V5 API Info
router.get('/', (req, res) => {
    res.json({
        version: 'v5',
        type: 'SOAP',
        description: 'MindBody API v5 SOAP-based endpoints',
        endpoints: {
            clients: '/clients',
            services: '/services',
            classes: '/classes',
            locations: '/locations',
            sites: '/sites'
        }
    })
})

// Client endpoints
router.get('/clients', checkService, async (req, res) => {
    try {
        const { email, site_id } = req.query
        const mindbodyV5 = getMindbodyV5Service(site_id)
        const result = await mindbodyV5.GetClients({ email })
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to get clients', message: error.message })
    }
})

router.post('/clients', checkService, async (req, res) => {
    try {
        const { site_id } = req.body
        const mindbodyV5 = getMindbodyV5Service(site_id)
        const result = await mindbodyV5.AddOrUpdateClients(req.body)
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to add/update client', message: error.message })
    }
})

router.get('/clients/:clientId/services', checkService, async (req, res) => {
    try {
        const { clientId } = req.params
        const { class_id, site_id } = req.query
        const mindbodyV5 = getMindbodyV5Service(site_id)
        const result = await mindbodyV5.GetClientServices({ client_id: clientId, class_id })
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to get client services', message: error.message })
    }
})

router.put('/clients/services', checkService, async (req, res) => {
    try {
        const { site_id } = req.body
        const mindbodyV5 = getMindbodyV5Service(site_id)
        const result = await mindbodyV5.UpdateClientServices(req.body)
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to update client services', message: error.message })
    }
})

// Service endpoints
router.get('/services', checkService, async (req, res) => {
    try {
        const { class_id, site_id } = req.query
        const mindbodyV5 = getMindbodyV5Service(site_id)
        const result = await mindbodyV5.GetServices({ class_id })
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to get services', message: error.message })
    }
})

router.post('/services/checkout', checkService, async (req, res) => {
    try {
        const { site_id } = req.body
        const mindbodyV5 = getMindbodyV5Service(site_id)
        const result = await mindbodyV5.CheckoutShoppingCart(req.body)
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to checkout', message: error.message })
    }
})

// Class endpoints
router.get('/classes', checkService, async (req, res) => {
    try {
        const { location_id, class_id, start_date, end_date, site_id } = req.query
        const mindbodyV5 = getMindbodyV5Service(site_id)
        const result = await mindbodyV5.GetClasses({ location_id, class_id, start_date, end_date })
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to get classes', message: error.message })
    }
})

router.get('/classes/schedules', checkService, async (req, res) => {
    try {
        const { location_id, start_date, end_date, site_id } = req.query
        const mindbodyV5 = getMindbodyV5Service(site_id)
        const result = await mindbodyV5.GetClassSchedules({ location_id, start_date, end_date })
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to get class schedules', message: error.message })
    }
})

router.get('/classes/:classId/visits', checkService, async (req, res) => {
    try {
        const { classId } = req.params
        const { site_id } = req.query
        const mindbodyV5 = getMindbodyV5Service(site_id)
        const result = await mindbodyV5.GetClassVisits({ class_id: classId })
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to get class visits', message: error.message })
    }
})

router.post('/classes/add-clients', checkService, async (req, res) => {
    try {
        const { site_id } = req.body
        const mindbodyV5 = getMindbodyV5Service(site_id)
        const result = await mindbodyV5.AddClientsToClasses(req.body)
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to add clients to class', message: error.message })
    }
})

router.post('/classes/remove-clients', checkService, async (req, res) => {
    try {
        const { site_id } = req.body
        const mindbodyV5 = getMindbodyV5Service(site_id)
        const result = await mindbodyV5.RemoveClientsFromClasses(req.body)
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to remove clients from class', message: error.message })
    }
})

// Location and Site endpoints
router.get('/locations', checkService, async (req, res) => {
    try {
        const { site_id } = req.query
        const mindbodyV5 = getMindbodyV5Service(site_id)
        const result = await mindbodyV5.GetLocations()
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to get locations', message: error.message })
    }
})

router.get('/sites', checkService, async (req, res) => {
    try {
        console.log(req.query)
        process.exit(1)
        const { site_id } = req.query
        const mindbodyV5 = getMindbodyV5Service(site_id)
        const result = await mindbodyV5.GetSites()
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to get sites', message: error.message })
    }
})

// Helper endpoints
router.post('/services/find', checkService, async (req, res) => {
    try {
        const { params, matchFunction, site_id } = req.body
        const mindbodyV5 = getMindbodyV5Service(site_id)
        // Note: This would need the matchFunction to be passed properly
        const result = await mindbodyV5.GetService(params, eval(matchFunction))
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to find service', message: error.message })
    }
})

router.post('/clients/services/void', checkService, async (req, res) => {
    try {
        const { site_id } = req.body
        const mindbodyV5 = getMindbodyV5Service(site_id)
        const result = await mindbodyV5.VoidClientService(req.body)
        res.json({ success: true, data: result })
    } catch (error) {
        res.status(500).json({ error: 'Failed to void client service', message: error.message })
    }
})

module.exports = router
