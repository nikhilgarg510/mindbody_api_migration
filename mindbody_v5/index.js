const moment = require('moment')
const soapRequest = require('./soap-request')
const requestCleaners = require('./mindbody-request-cleaners')
const responseCleaners = require('./mindbody-response-cleaners')

const mindbodyService = function ({
  site_id,
  username,
  password,
}) {
  const source_credentials = requestCleaners.cleanSiteSourceCredentials({ site_id })
  const user_credentials = requestCleaners.cleanSiteUserCredentials({
    site_id,
    username,
    password,
  })

  const exec = async (action, params = {}) => {
    const {
      endpoint,
      resolve,
    } = requestCleaners.actions[action]

    const xmls = resolve({
      action,
      source_credentials,
      user_credentials,
      ...params,
    }, params)

    const headers = requestCleaners.getHeaders({
      action,
    })

    const soap_response = await soapRequest({
      endpoint,
      headers,
      xmls,
    })

    return {
      request: {
        endpoint,
        headers,
        xmls,
      },
      response: soap_response,
    }
  }

  const service = {}

  service.CheckoutShoppingCart = async (params) => {
    const {
      response,
      request,
    } = await exec('CheckoutShoppingCart', params)
    _log({ request, response })
    return responseCleaners.actions.CheckoutShoppingCart(response)
  }
  service.GetServices = async (params) => {
    const {
      response,
      request,
    } = await exec('GetServices', params)
    _log({ request, response })
    return responseCleaners.actions.GetServices(response)
  }
  service.GetClientServices = async (params) => {
    const {
      response,
      request,
    } = await exec('GetClientServices', params)
    _log({ request, response })
    return responseCleaners.actions.GetClientServices(response)
  }
  service.GetClients = async (params) => {
    const {
      response,
      request,
    } = await exec('GetClients', params)
    _log({ request, response })
    return responseCleaners.actions.GetClients(response)
  }
  service.UpdateClientServices = async (params) => {
    const {
      response,
      request,
    } = await exec('UpdateClientServices', params)
    _log({ request, response })
    return responseCleaners.actions.UpdateClientServices(response)
  }
  service.GetClassSchedules = async (params) => {
    const {
      response,
      request,
    } = await exec('GetClassSchedules', params)
    _log({ request, response })
    return responseCleaners.actions.GetClassSchedules(response)
  }
  service.GetClasses = async (params) => {
    const {
      response,
      request,
    } = await exec('GetClasses', params)
    _log({ request, response })
    return responseCleaners.actions.GetClasses(response)
  }
  service.GetClassVisits = async (params) => {
    const {
      response,
      request,
    } = await exec('GetClassVisits', params)
    _log({ request, response })
    return responseCleaners.actions.GetClassVisits(response)
  }
  service.GetSites = async (params) => {
    const {
      response,
      request,
    } = await exec('GetSites', params)
    _log({ request, response })
    return responseCleaners.actions.GetSites(response)
  }
  service.GetLocations = async (params) => {
    const {
      response,
      request,
    } = await exec('GetLocations', params)
    _log({ request, response })
    return responseCleaners.actions.GetLocations(response)
  }
  service.AddOrUpdateClients = async (params) => {
    const {
      response,
      request,
    } = await exec('AddOrUpdateClients', params)
    _log({ request, response })
    return responseCleaners.actions.AddOrUpdateClients(response)
  }
  service.AddClientsToClasses = async (params) => {
    const {
      response,
      request,
    } = await exec('AddClientsToClasses', params)
    _log({ request, response })
    const success = await responseCleaners.actions.AddClientsToClasses(response)
    if (!success) {
      console.log(response)
    }
    return success
  }
  service.RemoveClientsFromClasses = async (params) => {
    const {
      response,
      request,
    } = await exec('RemoveClientsFromClasses', params)
    _log({ request, response })
    return responseCleaners.actions.RemoveClientsFromClasses(response)
  }

  // helpers

  service.GetService = async (params, matchFn) => {
    const payment_services = await service.GetServices(params)
    for (const payment_service of payment_services) {
      const is_match = await matchFn(payment_service) // eslint-disable-line no-await-in-loop
      if (is_match === true) {
        return payment_service
      }
    }
    return null
  }
  service.VoidClientService = async (params) => {
    const active_date = moment().subtract(3, 'day')
    const expiration_date = moment().subtract(2, 'day')
    return service.UpdateClientServices({
      ...params,
      active_date,
      expiration_date,
    })
  }

  // utils
  const _log = async ({
    request,
    response,
  }) => {
    const clean_request = request.xmls.replace(/<(SourceCredentials|UserCredentials)>(.|\n)+<\/(SourceCredentials|UserCredentials)>/ig, '<CredentialsRemoved />')
    const json_string = JSON.stringify({
      MINDBODY_REQUEST: process.env.NODE_ENV === 'production' ? clean_request : request,
      MINDBODY_RESPONSE: response,
    })
    /* eslint-disable no-console */
    console.log(json_string)
    /* eslint-enable no-console */
  }

  return service
}

module.exports = mindbodyService
