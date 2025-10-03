const moment = require('moment')
// MindBody API v6 Service - Pure v6 Implementation
const MindBodyV6Service = require('./mindbody-v6-service')

const mindbodyService = function ({
  site_id,
  username,
  password,
}) {
  // Create v6 service instance - no v5 fallback
  const v6Service = new MindBodyV6Service({
    site_id,
    username,
    password,
    api_key: process.env.MINDBODY_API_KEY
  })

  const service = {}

  // MindBody API v6 REST - Pure v6 Implementation (no v5 fallback)

  service.CheckoutShoppingCart = async (params) => {
    const result = await v6Service.CheckoutShoppingCart(params)
    _logV6({ action: 'CheckoutShoppingCart', params, result })
    return result
  }

  service.GetServices = async (params) => {
    try {
      const result = await v6Service.GetServices(params)
      _logV6({ action: 'GetServices', params, result })
      return result
    } catch (error) {
      _logV6({ action: 'GetServices', params, error: error.message })
      throw error
    }
  }

  service.GetClientServices = async (params) => {
    const result = await v6Service.GetClientServices(params)
    _logV6({ action: 'GetClientServices', params, result })
    return result
  }

  service.GetClients = async (params) => {
    try {

      const result = await v6Service.GetClients(params)
      _logV6({ action: 'GetClients', params, result })
      return result
    } catch (error) {
      _logV6({ action: 'GetClients', params, error: error.message })
      throw error
    }
  }

  service.UpdateClientServices = async (params) => {
    const result = await v6Service.UpdateClientServices(params)
    _logV6({ action: 'UpdateClientServices', params, result })
    return result
  }

  service.GetClassSchedules = async (params) => {
    const result = await v6Service.GetClassSchedules(params)
    _logV6({ action: 'GetClassSchedules', params, result })
    return result
  }

  service.GetClasses = async (params) => {
    try {
      const result = await v6Service.GetClasses(params)
      _logV6({ action: 'GetClasses', params, result })
      return result
    } catch (error) {
      _logV6({ action: 'GetClasses', params, error: error.message })
      throw error
    }
  }

  service.GetClassVisits = async (params) => {
    const result = await v6Service.GetClassVisits(params)
    _logV6({ action: 'GetClassVisits', params, result })
    return result
  }

  service.GetSites = async (params) => {
    const result = await v6Service.GetSites(params)
    _logV6({ action: 'GetSites', params, result })
    return result
  }

  service.GetLocations = async (params) => {
    try {
      const result = await v6Service.GetLocations(params)
      _logV6({ action: 'GetLocations', params, result })
      return result
    } catch (error) {
      _logV6({ action: 'GetLocations', params, error: error.message })
      throw error
    }
  }

  service.AddOrUpdateClients = async (params) => {
    // v6 service already includes email retry logic
    const result = await v6Service.AddOrUpdateClients(params)
    _logV6({ action: 'AddOrUpdateClients', params, result })
    return result
  }

  service.AddClientsToClasses = async (params) => {
    const result = await v6Service.AddClientsToClasses(params)
    _logV6({ action: 'AddClientsToClasses', params, result })
    return result
  }

  service.RemoveClientsFromClasses = async (params) => {
    const result = await v6Service.RemoveClientsFromClasses(params)
    _logV6({ action: 'RemoveClientsFromClasses', params, result })
    return result
  }

  // Helper methods - Pure v6 implementation

  service.GetService = async (params, matchFn) => {
    return await v6Service.GetService(params, matchFn)
  }

  service.VoidClientService = async (params) => {
    return await v6Service.VoidClientService(params)
  }

  // Logging utility - v6 only

  const _logV6 = ({ action, params, result }) => {
    const json_string = JSON.stringify({
      MINDBODY_V6_ACTION: action,
      MINDBODY_V6_PARAMS: params,
      MINDBODY_V6_RESULT: result,
      API_VERSION: 'v6 REST'
    })
    /* eslint-disable no-console */
    console.log(json_string)
    /* eslint-enable no-console */
  }

  return service
}

module.exports = mindbodyService
