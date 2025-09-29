const parse = require('xml-parser')

const processSoapResponse = (response) => {
  const parsed_response = parse(response)
  const soap_body = parsed_response.root.children
  const request_result = soap_body[0].children[0].children[0]
  return request_result
}

const getChildFields = (obj, fields) => {
  const response = {}
  for (const field of fields) {
    try {
      const prodigal_child = obj.children.find((f) => f.name === field.name)
      response[field.result_property] = field.resolve ? field.resolve(prodigal_child) : prodigal_child.content
    }
    catch (err) {
      console.log(err.message)
      console.log(JSON.stringify(obj, null, '  '))
    }
  }
  return response
}

const _parseInt = (v) => parseInt(v.content, 10)
const _parseBool = (v) => v.content === 'true'

const actions = {
  GetActivationCode: (soap_response) => processSoapResponse(soap_response),
  GetRequiredClientFields: (soap_response) => processSoapResponse(soap_response),
  AddOrUpdateClients: (soap_response) => {
    const parsed_result = processSoapResponse(soap_response)
    const clients = parsed_result.children.find((d) => d.name === 'Clients')
    if (!clients) {
      throw new Error(JSON.stringify(parsed_result))
    }
    const response = []
    for (const child of clients.children) {
      response.push(getChildFields(child, [
        {
          result_property: 'id',
          name: 'ID',
        },
      ]))
    }
    return response
  },
  CheckoutShoppingCart: (soap_response) => {
    const parsed_result = processSoapResponse(soap_response)
    const status = parsed_result.children.find((d) => d.name === 'Status')
    return status.content === 'Success'
  },
  GetServices: (soap_response) => {
    const parsed_result = processSoapResponse(soap_response)
    const services = parsed_result.children.find((d) => d.name === 'Services')
    const response = []
    for (const child of services.children) {
      response.push(getChildFields(child, [
        {
          result_property: 'id',
          name: 'ID',
        },
        {
          result_property: 'name',
          name: 'Name',
        },
        {
          result_property: 'price',
          name: 'Price',
        },
        {
          result_property: 'count',
          name: 'Count',
          resolve: _parseInt,
        },
      ]))
    }
    return response
  },
  GetClientServices: (soap_response) => {
    const parsed_result = processSoapResponse(soap_response)
    const services = parsed_result.children.find((d) => d.name === 'ClientServices')
    const response = []
    for (const child of services.children) {
      response.push(getChildFields(child, [
        {
          result_property: 'id',
          name: 'ID',
        },
        {
          result_property: 'name',
          name: 'Name',
        },
      ]))
    }
    return response
  },
  GetClients: (soap_response) => {
    const parsed_result = processSoapResponse(soap_response)
    const clients = parsed_result.children.find((d) => d.name === 'Clients')
    if (!clients) {
      throw new Error(JSON.stringify(parsed_result))
    }
    const response = []
    for (const child of clients.children) {
      response.push(getChildFields(child, [
        {
          result_property: 'id',
          name: 'ID',
        },
      ]))
    }
    return response
  },
  UpdateClientServices: (soap_response) => {
    const parsed_result = processSoapResponse(soap_response)
    const status = parsed_result.children.find((d) => d.name === 'Status')
    return status.content === 'Success'
  },
  GetClasses: (soap_response) => {
    const parsed_result = processSoapResponse(soap_response)
    if (!parsed_result) {
      return []
    }
    const classes = parsed_result.children.find((d) => d.name === 'Classes')
    const response = []
    if (!classes) {
      return response
    }
    for (const child of classes.children) {
      response.push(getChildFields(child, [
        {
          result_property: 'max_capacity',
          name: 'MaxCapacity',
          resolve: _parseInt,
        },
        {
          result_property: 'web_capacity',
          name: 'WebCapacity',
          resolve: _parseInt,
        },
        {
          result_property: 'total_booked',
          name: 'TotalBooked',
          resolve: _parseInt,
        },
        {
          result_property: 'total_booked_wait_list',
          name: 'TotalBookedWaitlist',
          resolve: _parseInt,
        },
        {
          result_property: 'web_booked',
          name: 'WebBooked',
          resolve: _parseInt,
        },
        {
          result_property: 'is_cancelled',
          name: 'IsCanceled',
          resolve: _parseBool,
        },
        {
          result_property: 'active',
          name: 'Active',
          resolve: _parseBool,
        },
        {
          result_property: 'id',
          name: 'ID',
        },
        {
          result_property: 'class_schedule_id',
          name: 'ClassScheduleID',
        },
        {
          result_property: 'is_available',
          name: 'IsAvailable',
          resolve: _parseBool,
        },
        {
          result_property: 'start_date_time',
          name: 'StartDateTime',
        },
        {
          result_property: 'end_date_time',
          name: 'EndDateTime',
        },
        {
          result_property: 'name',
          name: 'ClassDescription',
          resolve: (v) => getChildFields(v, [
            {
              result_property: 'name',
              name: 'Name',
            },
          ]).name,
        },
        {
          result_property: 'description',
          name: 'ClassDescription',
          resolve: (v) => getChildFields(v, [
            {
              result_property: 'description',
              name: 'Description',
            },
          ]).description,
        },
        {
          result_property: 'staff',
          name: 'Staff',
          resolve: (v) => getChildFields(v, [
            {
              result_property: 'fname',
              name: 'FirstName',
            },
            {
              result_property: 'lname',
              name: 'LastName',
            },
          ]),
        },
      ]))
    }
    return response
  },
  GetClassVisits: (soap_response) => {
    const parsed_result = processSoapResponse(soap_response)
    if (!parsed_result) {
      console.log(parsed_result)
      return []
    }
    const mindbody_class = parsed_result.children.find((d) => d.name === 'Class')
    const response = []
    if (!mindbody_class) {
      return response
    }
    const visits = mindbody_class.children.find((d) => d.name === 'Visits')
    if (!visits) {
      return response
    }
    for (const child of visits.children) {
      response.push(getChildFields(child, [
        {
          result_property: 'id',
          name: 'ID',
          resolve: _parseInt,
        },
        {
          result_property: 'class_id',
          name: 'ClassID',
          resolve: _parseInt,
        },
        {
          result_property: 'checked_in',
          name: 'SignedIn',
          resolve: _parseBool,
        },
        {
          result_property: 'client',
          name: 'Client',
          resolve: (v) => getChildFields(v, [
            {
              result_property: 'id',
              name: 'ID',
            },
          ]),
        },
      ]))
    }
    return response
  },
  GetClassSchedules: (soap_response) => {
    const parsed_result = processSoapResponse(soap_response)
    const classes = parsed_result.children.find((d) => d.name === 'ClassSchedules')
    const response = []
    for (const child of classes.children) {
      response.push(getChildFields(child, [
        {
          result_property: 'id',
          name: 'ID',
        },
        {
          result_property: 'day_sunday',
          name: 'DaySunday',
          resolve: _parseBool,
        },
        {
          result_property: 'day_monday',
          name: 'DayMonday',
          resolve: _parseBool,
        },
        {
          result_property: 'day_tuesday',
          name: 'DayTuesday',
          resolve: _parseBool,
        },
        {
          result_property: 'day_wednesday',
          name: 'DayWednesday',
          resolve: _parseBool,
        },
        {
          result_property: 'day_thursday',
          name: 'DayThursday',
          resolve: _parseBool,
        },
        {
          result_property: 'day_friday',
          name: 'DayFriday',
          resolve: _parseBool,
        },
        {
          result_property: 'day_saturday',
          name: 'DaySaturday',
          resolve: _parseBool,
        },
        {
          result_property: 'start_time',
          name: 'StartTime',
        },
        {
          result_property: 'end_time',
          name: 'EndTime',
        },
        {
          result_property: 'name',
          name: 'ClassDescription',
          resolve: (v) => getChildFields(v, [
            {
              result_property: 'name',
              name: 'Name',
            },
          ]).name,
        },
      ]))
    }
    return response
  },
  GetSites: (soap_response) => {
    const parsed_result = processSoapResponse(soap_response)
    const sites = parsed_result.children.find((d) => d.name === 'Sites')
    const response = []
    for (const child of sites.children) {
      response.push(getChildFields(child, [
        {
          result_property: 'id',
          name: 'ID',
        },
        {
          result_property: 'name',
          name: 'Name',
        },
      ]))
    }
    return response
  },
  GetLocations: (soap_response) => {
    const parsed_result = processSoapResponse(soap_response)
    const locations = parsed_result.children.find((d) => d.name === 'Locations')
    const response = []
    for (const child of locations.children) {
      response.push(getChildFields(child, [
        {
          result_property: 'id',
          name: 'ID',
        },
        {
          result_property: 'name',
          name: 'Name',
        },
      ]))
    }
    return response
  },
  AddClientsToClasses: (soap_response) => {
    const parsed_result = processSoapResponse(soap_response)
    const status = parsed_result.children.find((d) => d.name === 'Status')
    if (status.content === 'Success') {
      return true
    }
    const message = parsed_result.children.find((d) => d.name === 'Message')
    return message.content
  },
  RemoveClientsFromClasses: (soap_response) => {
    const parsed_result = processSoapResponse(soap_response)
    const status = parsed_result.children.find((d) => d.name === 'Status')
    return status.content === 'Success'
  },
}

module.exports = {
  actions,
}
