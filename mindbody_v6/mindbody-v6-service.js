// MindBody API v6 REST Client
// Migrated from v5 SOAP to v6 REST architecture
const axios = require('axios')
const moment = require('moment')
const fs = require('fs').promises
const path = require('path')

const BASE_URL = 'https://api.mindbodyonline.com/public/v6'

class MindBodyV6Service {
    constructor({ site_id, username, password, api_key }) {
        //this.site_id = site_id
        this.site_id = process.env.MINDBODY_TEST_SITE_ID || -99
        this.username = username
        this.password = password
        this.api_key = api_key || process.env.MINDBODY_API_KEY
        this.access_token = null
        this.token_expires_at = null

        // Token file path for persistent storage
        this.tokenFilePath = path.join(__dirname, 'mindbody_v6_token.json')

        // Create axios instance with default headers
        this.client = axios.create({
            baseURL: BASE_URL,
            headers: {
                'Api-Key': this.api_key,
                'SiteId': this.site_id.toString(),
                'Content-Type': 'application/json'
            },
            timeout: 30000
        })
    }

    // v6 MIGRATION: Token file management methods
    async loadTokenFromFile() {
        try {
            const tokenData = await fs.readFile(this.tokenFilePath, 'utf8')
            const parsedData = JSON.parse(tokenData)

            console.log('📁 Token loaded from file:', {
                hasToken: !!parsedData.access_token,
                expiresAt: parsedData.token_expires_at,
                isExpired: moment().isAfter(moment(parsedData.token_expires_at))
            })

            return parsedData
        } catch (error) {
            // File doesn't exist or is corrupted
            console.log('📁 No valid token file found, will generate new token')
            return null
        }
    }

    async saveTokenToFile(tokenData) {
        try {
            const dataToSave = {
                access_token: tokenData.access_token,
                token_expires_at: tokenData.token_expires_at.toISOString(),
                site_id: this.site_id,
                generated_at: moment().toISOString()
            }

            await fs.writeFile(this.tokenFilePath, JSON.stringify(dataToSave, null, 2))
            console.log('💾 Token saved to file successfully')
        } catch (error) {
            console.error('❌ Failed to save token to file:', error.message)
            // Don't throw error - continue with in-memory token
        }
    }

    async getValidToken() {
        // First, try to load token from file
        if (!this.access_token || !this.token_expires_at) {
            const storedToken = await this.loadTokenFromFile()
            if (storedToken) {
                this.access_token = storedToken.access_token
                this.token_expires_at = moment(storedToken.token_expires_at)
            }
        }

        // Check if current token is valid
        if (this.access_token && this.token_expires_at && moment().isBefore(this.token_expires_at)) {
            console.log('✅ Using existing valid token')
            this.client.defaults.headers.Authorization = `Bearer ${this.access_token}`
            return this.access_token
        }

        // Token is expired or doesn't exist, generate new one
        console.log('🔄 Token expired or not found, generating new token...')
        await this.generateAndStoreToken()
        return this.access_token
    }

    async generateAndStoreToken(retryCount = 0) {
        const MAX_RETRIES = 3;
        const RETRY_DELAY = 3000; // 3 seconds

        try {
            console.log(`🔐 Generating new MindBody API v6 token... ${retryCount > 0 ? `(Retry ${retryCount}/${MAX_RETRIES})` : ''}`)

            const response = await this.client.post('/usertoken/issue', {
                Username: this.username,
                Password: this.password
            })

            if (response.data && response.data.AccessToken) {
                this.access_token = response.data.AccessToken
                // Tokens typically expire in 24 hours, set expiry to 23 hours for safety
                this.token_expires_at = moment().add(23, 'hours')

                // Update default authorization header
                this.client.defaults.headers.Authorization = `Bearer ${this.access_token}`

                // Save token to file for future use
                await this.saveTokenToFile({
                    access_token: this.access_token,
                    token_expires_at: this.token_expires_at
                })

                console.log('✅ New MindBody API v6 token generated and saved')
                return true
            } else {
                throw new Error('No access token in response')
            }
        } catch (error) {
            // Enhanced error handling with retry logic for network errors
            const isNetworkError = error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT';

            if (isNetworkError && retryCount < MAX_RETRIES) {
                console.warn(`⚠️ Network error occurred (${error.code}), retrying in ${RETRY_DELAY / 1000} seconds... (${retryCount + 1}/${MAX_RETRIES})`);

                // Wait for 3 seconds before retry
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));

                // Recursive retry
                return await this.generateAndStoreToken(retryCount + 1);
            }

            // If max retries reached or not a network error, handle as before
            // Handle HTTP response errors for authentication
            if (error.response) {
                const statusCode = error.response.status
                const responseData = error.response.data

                let errorMessage = `MindBody API v6 authentication failed with status ${statusCode}`
                let errorCode = 'AUTH_ERROR'

                if (statusCode === 401) {
                    errorMessage = 'Authentication failed: Invalid username or password'
                } else if (statusCode === 403) {
                    errorMessage = 'Authentication failed: Access forbidden - check API key and site permissions'
                } else if (statusCode === 404) {
                    errorMessage = 'Authentication failed: Authentication endpoint not found'
                }

                // Include additional error details if available
                if (responseData && responseData.Error) {
                    errorMessage += ` - ${responseData.Error.Message || responseData.Error}`
                } else if (responseData && responseData.message) {
                    errorMessage += ` - ${responseData.message}`
                }

                const authError = new Error(errorMessage)
                authError.code = errorCode
                authError.statusCode = statusCode
                authError.responseData = responseData
                authError.originalError = error

                console.error('❌', errorMessage)
                console.error('Response data:', responseData)

                throw authError
            } else {
                // Handle other types of errors
                const generalError = new Error(`MindBody API v6 authentication failed: ${error.message}`)
                generalError.code = 'AUTH_ERROR'
                generalError.originalError = error

                console.error('❌', generalError.message)
                throw generalError
            }
        }
    }

    // v6 MIGRATION: New token-based authentication system (DEPRECATED - use getValidToken instead)
    /*async authenticate() {
        try {
            console.log('🔐 Authenticating with MindBody API v6...')

            const response = await this.client.post('/usertoken/issue', {
                Username: this.username,
                Password: this.password
            })

            if (response.data && response.data.AccessToken) {
                this.access_token = response.data.AccessToken
                // Tokens typically expire in 24 hours, set expiry to 23 hours for safety
                this.token_expires_at = moment().add(23, 'hours')

                // Update default authorization header
                this.client.defaults.headers.Authorization = `Bearer ${this.access_token}`

                console.log('✅ MindBody API v6 authentication successful')
                return true
            } else {
                throw new Error('No access token in response')
            }
        } catch (error) {
            // Enhanced error handling to prevent server crashes
            if (error.code === 'ENOTFOUND') {
                const networkError = new Error('Network error: Cannot reach MindBody API servers. Check your internet connection and firewall settings.')
                networkError.code = 'NETWORK_ERROR'
                networkError.originalError = error
                console.error('❌', networkError.message)
                throw networkError
            } else if (error.code === 'ECONNREFUSED') {
                const connectionError = new Error('Connection refused: MindBody API servers are not responding.')
                connectionError.code = 'CONNECTION_REFUSED'
                connectionError.originalError = error
                console.error('❌', connectionError.message)
                throw connectionError
            } else if (error.code === 'ETIMEDOUT') {
                const timeoutError = new Error('Request timeout: MindBody API servers took too long to respond.')
                timeoutError.code = 'TIMEOUT_ERROR'
                timeoutError.originalError = error
                console.error('❌', timeoutError.message)
                throw timeoutError
            } else {
                console.error('❌ MindBody API v6 authentication failed:', error.message)
                throw error
            }
        }
    }*/

    // v6 MIGRATION: Automatic token refresh before requests (Updated to use file-based token management)
    async ensureAuthenticated() {
        try {
            await this.getValidToken()
        } catch (error) {
            // Re-throw with proper error context to prevent unhandled rejections
            throw error
        }
    }

    // v6 MIGRATION: Generic request wrapper with error handling
    async makeRequest(method, endpoint, data = null, params = null) {
        try {
            await this.ensureAuthenticated()
        } catch (authError) {
            // If authentication fails, throw a properly handled error
            const error = new Error(`Authentication failed: ${authError.message}`)
            error.code = authError.code || 'AUTH_ERROR'
            error.originalError = authError
            throw error
        }

        try {
            const config = {
                method,
                url: endpoint,
                ...(data && { data }),
                ...(params && { params })
            }

            const response = await this.client.request(config)
            return response.data
        } catch (error) {
            // Enhanced error handling for network and API errors
            if (error.code === 'ENOTFOUND') {
                const networkError = new Error(`Network error: Cannot reach MindBody API for ${method} ${endpoint}`)
                networkError.code = 'NETWORK_ERROR'
                networkError.originalError = error
                console.error('❌', networkError.message)
                throw networkError
            } else if (error.code === 'ECONNREFUSED') {
                const connectionError = new Error(`Connection refused: MindBody API not responding for ${method} ${endpoint}`)
                connectionError.code = 'CONNECTION_REFUSED'
                connectionError.originalError = error
                console.error('❌', connectionError.message)
                throw connectionError
            } else if (error.code === 'ETIMEDOUT') {
                const timeoutError = new Error(`Request timeout: ${method} ${endpoint} took too long`)
                timeoutError.code = 'TIMEOUT_ERROR'
                timeoutError.originalError = error
                console.error('❌', timeoutError.message)
                throw timeoutError
            } else {
                // Handle HTTP response errors (4xx, 5xx)
                if (error.response) {
                    const statusCode = error.response.status
                    const responseData = error.response.data

                    let errorMessage = `MindBody API v6 ${method} ${endpoint} failed with status ${statusCode}`
                    let errorCode = 'API_ERROR'

                    // Handle specific error codes
                    if (statusCode === 401) {
                        errorMessage = `Authentication failed for ${method} ${endpoint}: Invalid credentials or expired token`
                        errorCode = 'AUTH_ERROR'
                    } else if (statusCode === 403) {
                        errorMessage = `Access forbidden for ${method} ${endpoint}: Insufficient permissions or invalid API key`
                        errorCode = 'PERMISSION_ERROR'
                    } else if (statusCode === 404) {
                        errorMessage = `Resource not found for ${method} ${endpoint}: Invalid endpoint or resource ID`
                        errorCode = 'NOT_FOUND_ERROR'
                    } else if (statusCode === 429) {
                        errorMessage = `Rate limit exceeded for ${method} ${endpoint}: Too many requests`
                        errorCode = 'RATE_LIMIT_ERROR'
                    } else if (statusCode >= 500) {
                        errorMessage = `MindBody API server error for ${method} ${endpoint}: Server is experiencing issues`
                        errorCode = 'SERVER_ERROR'
                    }

                    // Include additional error details if available
                    if (responseData && responseData.Error) {
                        errorMessage += ` - ${responseData.Error.Message || responseData.Error}`
                    } else if (responseData && responseData.message) {
                        errorMessage += ` - ${responseData.message}`
                    }

                    const apiError = new Error(errorMessage)
                    apiError.code = errorCode
                    apiError.statusCode = statusCode
                    apiError.responseData = responseData
                    apiError.originalError = error

                    console.error('❌', errorMessage)
                    console.error('Response data:', responseData)

                    throw apiError
                } else {
                    // Handle other types of errors (network issues, etc.)
                    const generalError = new Error(`MindBody API v6 ${method} ${endpoint} failed: ${error.message}`)
                    generalError.code = 'REQUEST_ERROR'
                    generalError.originalError = error

                    console.error('❌', generalError.message)
                    throw generalError
                }
            }
        }
    }

    // v6 MIGRATION: GetClients endpoint - changed from SOAP to REST
    async GetClients({ email, client_ids = null, search_text = null } = {}) {
        const params = {}

        if (email) params.searchText = email
        if (search_text) params.searchText = search_text
        if (client_ids) params.clientIds = Array.isArray(client_ids) ? client_ids.join(',') : client_ids
        try {
            const response = await this.makeRequest('GET', '/client/clients', null, params)

            // v6 MIGRATION: Transform response to match v5 format for backward compatibility
            return response.Clients ? response.Clients.map(client => ({
                id: client.Id.toString()
            })) : []
        } catch (error) {
            console.error('Error fetching services:', error)
            throw error
        }
    }

    // v6 MIGRATION: AddOrUpdateClients split into separate endpoints
    async AddOrUpdateClients(params) {
        const {
            fname,
            lname,
            email,
            birthdate,
            street1,
            city,
            state,
            zip,
            phone,
            phone_carrier,
            id,
            gender,
            emergency_contact_email,
            emergency_contact_name,
            emergency_contact_phone,
            emergency_contact_relationship,
            referred_by
        } = params

        const clientData = {
            FirstName: fname,
            LastName: lname,
            Email: email,
            AddressLine1: street1,
            City: city,
            State: state,
            PostalCode: zip,
            BirthDate: moment(birthdate).format('YYYY-MM-DD'),
            MobilePhone: phone,
            Gender: gender,
            PromotionalEmailOptIn: false,
            ...(referred_by && { ReferredBy: referred_by }),
            ...(emergency_contact_email && { EmergencyContactInfoEmail: emergency_contact_email }),
            ...(emergency_contact_name && { EmergencyContactInfoName: emergency_contact_name }),
            ...(emergency_contact_phone && { EmergencyContactInfoPhone: emergency_contact_phone }),
            ...(emergency_contact_relationship && { EmergencyContactInfoRelationship: emergency_contact_relationship })
        }

        try {
            let response

            if (id) {
                // Update existing client
                response = await this.makeRequest('PUT', '/client/updateclient', {
                    Client: { ...clientData, Id: id }
                })
            } else {
                // Add new client  
                response = await this.makeRequest('POST', '/client/addclient', {
                    Client: clientData
                })
            }

            // v6 MIGRATION: Transform response to match v5 format
            if (response.Client) {
                return [{ id: response.Client.Id.toString() }]
            } else {
                return [{}] // Empty response to trigger retry logic
            }

        } catch (error) {
            // v6 MIGRATION: Handle email conflicts with retry logic (same as v5)
            if (error.response && error.response.status === 400) {
                console.log('Retrying AddOrUpdateClients with modified email')

                const emailParts = email.split('@')
                let localPart = emailParts[0]
                const domainPart = emailParts[1]

                let counter = 1
                const baseLocalPart = localPart.replace(/\+\d+$/, '')

                while (localPart.includes(`+${counter}`)) {
                    counter++
                }

                const newLocalPart = `${baseLocalPart}+${counter}`
                const newEmail = `${newLocalPart}@${domainPart}`
                const newParams = { ...params, email: newEmail }

                console.log('Modified email from', email, 'to', newEmail)
                return await this.AddOrUpdateClients(newParams)
            }

            throw error
        }
    }

    // v6 MIGRATION: GetServices endpoint - REST format
    async GetServices({ class_id = null } = {}) {
        const params = {}
        if (class_id) params.classId = class_id

        try {
            const response = await this.makeRequest('GET', '/sale/services', null, params)

            // v6 MIGRATION: Transform response to match v5 format
            return response.Services ? response.Services.map(service => ({
                id: service.Id.toString(),
                name: service.Name,
                price: service.Price,
                count: service.Count || 0
            })) : []

        } catch (error) {
            console.error('Error fetching services:', error)
            throw error
        }
    }

    // v6 MIGRATION: GetClientServices endpoint - REST format  
    async GetClientServices({ client_id, class_id } = {}) {
        const params = {
            clientId: client_id
        }
        if (class_id) params.classId = class_id

        try {
            const response = await this.makeRequest('GET', '/client/clientservices', null, params)

            // v6 MIGRATION: Transform response to match v5 format
            return response.ClientServices ? response.ClientServices.map(service => ({
                id: service.Id.toString(),
                name: service.Name
            })) : []
        } catch (error) {
            console.error('Error fetching services:', error)
            throw error
        }
    }

    // v6 MIGRATION: UpdateClientServices endpoint - REST format
    async UpdateClientServices({ client_service_id, active_date, expiration_date } = {}) {
        try {
            const response = await this.makeRequest('PUT', '/client/clientservices', {
                ClientService: {
                    Id: client_service_id,
                    ActiveDate: moment(active_date).format('YYYY-MM-DD'),
                    ExpirationDate: moment(expiration_date).format('YYYY-MM-DD')
                }
            })

            return response.Success || false
        } catch (error) {
            console.error('Error fetching services:', error)
            throw error
        }
    }

    // v6 MIGRATION: CheckoutShoppingCart endpoint - REST format
    async CheckoutShoppingCart({ client_id, service_id, amount } = {}) {
        try {
            const response = await this.makeRequest('POST', '/sale/checkoutshoppingcart', {
                ClientId: client_id,
                CartItems: [{
                    Quantity: 1,
                    Item: {
                        Type: 'Service',
                        Id: service_id
                    }
                }],
                Payments: [{
                    Type: 'Comp',
                    Amount: amount
                }],
                InStore: false,
                SendEmail: false,
                Test: false
            })

            return response.Success || false
        } catch (error) {
            console.error('Error fetching services:', error)
            throw error
        }
    }

    // v6 MIGRATION: GetClasses endpoint - REST format
    async GetClasses({ location_id, class_id, start_date, end_date } = {}) {
        const params = {}

        if (location_id) {
            params.locationIds = Array.isArray(location_id) ? location_id.join(',') : location_id
        }
        if (class_id) {
            params.classIds = Array.isArray(class_id) ? class_id.join(',') : class_id
        }
        if (start_date) {
            params.startDateTime = moment(start_date).format('YYYY-MM-DDTHH:mm:ss')
        }
        if (end_date) {
            params.endDateTime = moment(end_date).format('YYYY-MM-DDTHH:mm:ss')
        }

        try {

            const response = await this.makeRequest('GET', '/class/classes', null, params)

            // v6 MIGRATION: Transform response to match v5 format
            return response.Classes ? response.Classes.map(cls => ({
                max_capacity: cls.MaxCapacity || 0,
                web_capacity: cls.WebCapacity || 0,
                total_booked: cls.TotalBooked || 0,
                total_booked_wait_list: cls.TotalBookedWaitlist || 0,
                web_booked: cls.WebBooked || 0,
                is_cancelled: cls.IsCanceled || false,
                active: cls.Active || false,
                id: cls.Id.toString(),
                class_schedule_id: cls.ClassScheduleId.toString(),
                is_available: cls.IsAvailable || false,
                start_date_time: cls.StartDateTime,
                end_date_time: cls.EndDateTime,
                name: cls.ClassDescription ? cls.ClassDescription.Name : '',
                description: cls.ClassDescription ? cls.ClassDescription.Description : '',
                staff: cls.Staff ? {
                    fname: cls.Staff.FirstName,
                    lname: cls.Staff.LastName
                } : {}
            })) : []
        } catch (error) {
            console.error('Error fetching services:', error)
            throw error
        }
    }

    // v6 MIGRATION: GetClassVisits endpoint - REST format
    async GetClassVisits({ class_id } = {}) {
        try {
            const response = await this.makeRequest('GET', '/class/classvisits', null, {
                classId: class_id
            })

            // v6 MIGRATION: Transform response to match v5 format
            if (response.Class && response.Class.Visits) {
                return response.Class.Visits.map(visit => ({
                    id: visit.Id,
                    class_id: visit.ClassId,
                    checked_in: visit.SignedIn || false,
                    client: {
                        id: visit.Client ? visit.Client.Id.toString() : ''
                    }
                }))
            }
            return []
        } catch (error) {
            console.error('Error fetching services:', error)
            throw error
        }
    }

    // v6 MIGRATION: GetClassSchedules endpoint - REST format
    async GetClassSchedules({ location_id, start_date, end_date } = {}) {
        const params = {}

        if (location_id) params.locationIds = location_id
        if (start_date) params.startDateTime = moment(start_date).format('YYYY-MM-DDTHH:mm:ss')
        if (end_date) params.endDateTime = moment(end_date).format('YYYY-MM-DDTHH:mm:ss')
        try {

            const response = await this.makeRequest('GET', '/class/classschedules', null, params)

            // v6 MIGRATION: Transform response to match v5 format
            return response.ClassSchedules ? response.ClassSchedules.map(schedule => ({
                id: schedule.Id.toString(),
                day_sunday: schedule.DaySunday || false,
                day_monday: schedule.DayMonday || false,
                day_tuesday: schedule.DayTuesday || false,
                day_wednesday: schedule.DayWednesday || false,
                day_thursday: schedule.DayThursday || false,
                day_friday: schedule.DayFriday || false,
                day_saturday: schedule.DaySaturday || false,
                start_time: schedule.StartTime,
                end_time: schedule.EndTime,
                name: schedule.ClassDescription ? schedule.ClassDescription.Name : ''
            })) : []
        } catch (error) {
            console.error('Error fetching services:', error)
            throw error
        }
    }

    // v6 MIGRATION: GetSites endpoint - REST format
    async GetSites() {
        try {
            const response = await this.makeRequest('GET', '/site/sites')

            // v6 MIGRATION: Transform response to match v5 format
            return response.Sites ? response.Sites.map(site => ({
                id: site.Id.toString(),
                name: site.Name
            })) : []
        } catch (error) {
            console.error('Error fetching services:', error)
            throw error
        }
    }

    // v6 MIGRATION: GetLocations endpoint - REST format
    async GetLocations() {
        try {
            const response = await this.makeRequest('GET', '/site/locations')

            // v6 MIGRATION: Transform response to match v5 format
            return response.Locations ? response.Locations.map(location => ({
                id: location.Id.toString(),
                name: location.Name
            })) : []
        } catch (error) {
            console.error('Error fetching services:', error)
            throw error
        }
    }

    // v6 MIGRATION: AddClientsToClasses endpoint - REST format
    async AddClientsToClasses({ client_id, class_id, client_service_id = null } = {}) {
        try {
            const response = await this.makeRequest('POST', '/class/addclientstoclass', {
                ClientIds: Array.isArray(client_id) ? client_id : [client_id],
                ClassIds: Array.isArray(class_id) ? class_id : [class_id],
                SendEmail: false,
                Test: false,
                ...(client_service_id && { ClientServiceId: client_service_id })
            })

            if (response.Success) {
                return true
            } else {
                return response.Message || 'Unknown error'
            }
        } catch (error) {
            console.error('Error fetching services:', error)
            throw error
        }
    }

    // v6 MIGRATION: RemoveClientsFromClasses endpoint - REST format  
    async RemoveClientsFromClasses({ client_id, class_id, late_cancel = false } = {}) {
        try {
            const response = await this.makeRequest('POST', '/class/removeclientsfromclass', {
                ClientIds: Array.isArray(client_id) ? client_id : [client_id],
                ClassIds: Array.isArray(class_id) ? class_id : [class_id],
                SendEmail: false,
                LateCancel: late_cancel,
                Test: false
            })

            return response.Success || false
        } catch (error) {
            console.error('Error fetching services:', error)
            throw error
        }
    }

    // Helper methods (unchanged from v5)

    async GetService(params, matchFn) {
        const services = await this.GetServices(params)
        for (const service of services) {
            const is_match = await matchFn(service)
            if (is_match === true) {
                return service
            }
        }
        return null
    }

    async VoidClientService(params) {
        const active_date = moment().subtract(3, 'day')
        const expiration_date = moment().subtract(2, 'day')
        return this.UpdateClientServices({
            ...params,
            active_date,
            expiration_date
        })
    }
}

module.exports = MindBodyV6Service
