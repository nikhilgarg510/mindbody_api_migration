const moment = require('moment')
const phone_carriers = require('../phone-carriers')

const cleanMindbodyWrapper = (body) => `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns="http://clients.mindbodyonline.com/api/0_5">
  <soap:Body>
    ${body}
  </soap:Body>
</soap:Envelope>`

const cleanSiteSourceCredentials = ({ site_id }) => `<SourceCredentials>
  <SourceName>${process.env.MINDBODY_SOURCE_NAME}</SourceName>
  <Password>${process.env.MINDBODY_SOURCE_PASSWORD}</Password>
  ${site_id !== undefined ? (
    `
      <SiteIDs>
        ${Array.isArray(site_id) ? site_id.map(((id) => `<int>${id}</int>`)) : `<int>${site_id}</int>`
    }
      </SiteIDs>
      `
  ) : ''
  }
</SourceCredentials>`

const cleanSiteUserCredentials = ({
  username,
  password,
  site_id,
}) => `<UserCredentials>
  <Username>${username}</Username>
  <Password>${password}</Password>
  <SiteIDs>
    <int>${site_id}</int>
  </SiteIDs>
</UserCredentials>`

const actions = {
  GetActivationCode: {
    endpoint: 'https://api.mindbodyonline.com/0_5/SiteService.asmx',
    resolve: ({
      source_credentials,
    }) => resolveWrapper({
      action: 'GetActivationCode',
      source_credentials,
      body: '<XMLDetail>Full</XMLDetail>',
    }),
  },
  GetRequiredClientFields: {
    endpoint: 'https://api.mindbodyonline.com/0_5/ClientService.asmx',
    resolve: ({
      source_credentials,
    }) => resolveWrapper({
      action: 'GetRequiredClientFields',
      source_credentials,
      body: '<XMLDetail>Full</XMLDetail>',
    }),
  },
  AddOrUpdateClients: {
    endpoint: 'https://api.mindbodyonline.com/0_5/ClientService.asmx',
    resolve: ({
      source_credentials,
      fname, // string
      lname, // string
      email, // string
      birthdate, // moment / date
      street1, // string
      city, // string
      state, // string
      zip, // string
      phone, // string
      phone_carrier, // string
      id, // string
      gender, // string
      emergency_contact_email, // string
      emergency_contact_name, // string
      emergency_contact_phone, // string
      emergency_contact_relationship, // string
      referred_by, // string
    }) => resolveWrapper({
      action: 'AddOrUpdateClients',
      source_credentials,
      body: `<XMLDetail>Full</XMLDetail>
        <Test>false</Test>
        <SendEmail>false</SendEmail>
        <Clients>
          <Client>
            <FirstName>${fname}</FirstName>
            <LastName>${lname}</LastName>
            <Email>${email}</Email>
            <AddressLine1>${street1}</AddressLine1>
            <State>${state}</State>
            <City>${city}</City>
            <PostalCode>${zip}</PostalCode>
            ${referred_by ? `<ReferredBy>${referred_by}</ReferredBy>` : ''}
            <BirthDate>${moment(birthdate).format('YYYY-MM-DD')}T00:00:00</BirthDate>
            <MobilePhone>${phone}</MobilePhone>
            <MobileProvider>${phone_carriers[phone_carrier] ? phone_carriers[phone_carrier].mindbody_id : 0}</MobileProvider>
            <Gender>${gender}</Gender>
            ${emergency_contact_email ? `<EmergencyContactInfoEmail>${emergency_contact_email}</EmergencyContactInfoEmail>` : ''}
            ${emergency_contact_name ? `<EmergencyContactInfoName>${emergency_contact_name}</EmergencyContactInfoName>` : ''}
            ${emergency_contact_phone ? `<EmergencyContactInfoPhone>${emergency_contact_phone}</EmergencyContactInfoPhone>` : ''}
            ${emergency_contact_relationship ? `<EmergencyContactInfoRelationship>${emergency_contact_relationship}</EmergencyContactInfoRelationship>` : ''}
            ${id ? `<ID>${id}</ID>` : ''}
            <PromotionalEmailOptIn>false</PromotionalEmailOptIn>
          </Client>
        </Clients>`,
    }),
  },
  CheckoutShoppingCart: {
    endpoint: 'https://api.mindbodyonline.com/0_5/SaleService.asmx',
    resolve: ({
      source_credentials,
      user_credentials,
      client_id,
      service_id,
      amount,
    }) => resolveWrapper({
      action: 'CheckoutShoppingCart',
      source_credentials,
      user_credentials,
      body: `<XMLDetail>Full</XMLDetail>
        <ClientID>${client_id}</ClientID>
        <Test>false</Test>
        <CartItems>
          <CartItem>
            <Quantity>1</Quantity>
            <Item xsi:type="Service">
              <ID>${service_id}</ID>
            </Item>
          </CartItem>
        </CartItems>
        <Payments>
          <PaymentInfo xsi:type="CompInfo">
            <Amount>${amount}</Amount>
          </PaymentInfo>
        </Payments>
        <InStore>false</InStore>
        <SendEmail>false</SendEmail>
        <RequirePayment>false</RequirePayment>`,
    }),
  },
  GetServices: {
    endpoint: 'https://api.mindbodyonline.com/0_5/SaleService.asmx',
    resolve: ({
      source_credentials,
      user_credentials,
      class_id,
    }) => resolveWrapper({
      action: 'GetServices',
      source_credentials,
      user_credentials,
      body: `<XMLDetail>Full</XMLDetail>
        <PageSize>1000</PageSize>
        <SellOnline>false</SellOnline>
        <CurrentPageIndex>0</CurrentPageIndex>
        ${class_id ? `<ClassID>${class_id}</ClassID>` : ''}`,
    }),
  },
  GetClientServices: {
    endpoint: 'https://api.mindbodyonline.com/0_5/ClientService.asmx',
    resolve: ({
      source_credentials,
      user_credentials,
      client_id,
      class_id,
    }) => resolveWrapper({
      action: 'GetClientServices',
      source_credentials,
      user_credentials,
      body: `
        <ClientID>${client_id}</ClientID>
        <ClassID>${class_id}</ClassID>`,
    }),
  },
  GetClients: {
    endpoint: 'https://api.mindbodyonline.com/0_5/ClientService.asmx',
    resolve: ({
      source_credentials,
      user_credentials,
      email,
    }) => resolveWrapper({
      action: 'GetClients',
      source_credentials,
      user_credentials,
      body: `
      <XMLDetail>Full</XMLDetail>
      <PageSize>1500</PageSize>
      <CurrentPageIndex>0</CurrentPageIndex>
      ${email ? (
          `<SearchText>${email}</SearchText>`
        ) : ''
        }
      `,
    }),
  },
  UpdateClientServices: {
    endpoint: 'https://api.mindbodyonline.com/0_5/ClientService.asmx',
    resolve: ({
      source_credentials,
      user_credentials,
      client_service_id,
      active_date,
      expiration_date,
    }) => resolveWrapper({
      action: 'UpdateClientServices',
      source_credentials,
      user_credentials,
      body: `
      <ClientServices>
        <ClientService>
          <ID>${client_service_id}</ID>
          <ActiveDate>${moment(active_date).format('YYYY-MM-DD')}</ActiveDate>
          <ExpirationDate>${moment(expiration_date).format('YYYY-MM-DD')}</ExpirationDate>
         </ClientService>
       </ClientServices>`,
    }),
  },
  GetClassSchedules: {
    endpoint: 'https://api.mindbodyonline.com/0_5/ClassService.asmx',
    resolve: ({
      source_credentials,
      location_id,
      start_date = moment().startOf('day'),
      end_date = moment().endOf('day'),
    }) => resolveWrapper({
      action: 'GetClassSchedules',
      source_credentials,
      body: `<XMLDetail>Full</XMLDetail>
        <PageSize>100</PageSize>
        <LocationIDs>
          <int>${location_id}</int>
        </LocationIDs>
        <StartDateTime>${moment(start_date).format('YYYY-MM-DDThh:mm:ss')}</StartDateTime>
        <EndDateTime>${moment(end_date).format('YYYY-MM-DDThh:mm:ss')}</EndDateTime>`,
    }),
  },
  GetClasses: {
    endpoint: 'https://api.mindbodyonline.com/0_5/ClassService.asmx',
    resolve: ({
      source_credentials,
      user_credentials,
      location_id,
      class_id,
      start_date = moment().subtract(100, 'day'),
      end_date = moment().add(100, 'day'),
    }) => resolveWrapper({
      action: 'GetClasses',
      source_credentials,
      user_credentials,
      body: `<XMLDetail>Full</XMLDetail>
        <PageSize>1000</PageSize>
        ${location_id !== undefined ? (
          `
            <LocationIDs>
              ${Array.isArray(location_id) ? location_id.map(((id) => `<int>${id}</int>`)) : `<int>${location_id}</int>`
          }
            </LocationIDs>
            `
        ) : ''
        }
        ${class_id !== undefined ? (
          `
            <ClassIDs>
              ${Array.isArray(class_id) ? class_id.map(((id) => `<int>${id}</int>`)) : `<int>${class_id}</int>`
          }
            </ClassIDs>
            `
        ) : ''
        }
        ${start_date ? (
          `<StartDateTime>${moment(start_date).format('YYYY-MM-DDThh:mm:ss')}</StartDateTime>`
        ) : ''
        }
        ${end_date ? (
          `<EndDateTime>${moment(end_date).format('YYYY-MM-DDThh:mm:ss')}</EndDateTime>`
        ) : ''
        }`,
    }),
  },
  GetClassVisits: {
    endpoint: 'https://api.mindbodyonline.com/0_5/ClassService.asmx',
    resolve: ({
      source_credentials,
      user_credentials,
      class_id,
    }) => resolveWrapper({
      action: 'GetClassVisits',
      source_credentials,
      user_credentials,
      body: `
        <ClassID>${class_id}</ClassID>
      `,
    }),
  },
  GetSites: {
    endpoint: 'https://api.mindbodyonline.com/0_5/SiteService.asmx',
    resolve: ({
      source_credentials,
    }) => resolveWrapper({
      action: 'GetSites',
      source_credentials,
      body: `<XMLDetail>Full</XMLDetail>
        <PageSize>1000</PageSize>
        <CurrentPageIndex>0</CurrentPageIndex>`,
    }),
  },
  GetLocations: {
    endpoint: 'https://api.mindbodyonline.com/0_5/SiteService.asmx',
    resolve: ({
      source_credentials,
    }) => resolveWrapper({
      action: 'GetLocations',
      source_credentials,
      body: `<XMLDetail>Full</XMLDetail>
        <PageSize>1000</PageSize>
        <CurrentPageIndex>0</CurrentPageIndex>`,
    }),
  },
  AddClientsToClasses: {
    endpoint: 'https://api.mindbodyonline.com/0_5/ClassService.asmx',
    resolve: ({
      source_credentials,
      user_credentials,
      client_id,
      class_id,
      client_service_id,
    }) => resolveWrapper({
      action: 'AddClientsToClasses',
      source_credentials,
      user_credentials,
      body: `<XMLDetail>Full</XMLDetail>
        <ClientIDs>
          ${Array.isArray(client_id) ? (
          client_id.map((id) => `<string>${id}</string>`)
        ) : (
          `<string>${client_id}</string>`
        )}
        </ClientIDs>
        <ClassIDs>
          ${Array.isArray(class_id) ? (
          class_id.map((id) => `<string>${id}</string>`)
        ) : (
          `<int>${class_id}</int>`
        )}
        </ClassIDs>
        <SendEmail>false</SendEmail>
        <Test>false</Test>
        ${client_service_id ? `<ClientServiceID>${client_service_id}</ClientServiceID>` : ''}`,
    }),
  },
  RemoveClientsFromClasses: {
    endpoint: 'https://api.mindbodyonline.com/0_5/ClassService.asmx',
    resolve: ({
      source_credentials,
      user_credentials,
      client_id,
      class_id,
      late_cancel = false,
    }) => resolveWrapper({
      action: 'RemoveClientsFromClasses',
      source_credentials,
      user_credentials,
      body: `<XMLDetail>Full</XMLDetail>
        <ClientIDs>
          ${Array.isArray(client_id) ? (
          client_id.map((id) => `<string>${id}</string>`)
        ) : (
          `<string>${client_id}</string>`
        )}
        </ClientIDs>
        <ClassIDs>
          ${Array.isArray(class_id) ? (
          class_id.map((id) => `<string>${id}</string>`)
        ) : (
          `<int>${class_id}</int>`
        )}
        </ClassIDs>
        <SendEmail>false</SendEmail>
        <LateCancel>${late_cancel ? 'true' : 'false'}</LateCancel>
        <Test>false</Test>`,
    }),
  },
}

const resolveWrapper = ({
  action,
  source_credentials,
  user_credentials,
  body,
}) => `${cleanMindbodyWrapper(`
  <${action}>
    <Request>
      ${source_credentials || ''}
      ${user_credentials || ''}
      ${body}
    </Request>
  </${action}>
`)}`

const getHeaders = ({
  action,
}) => ({
  SOAPAction: `http://clients.mindbodyonline.com/api/0_5/${action}`,
})

module.exports = {
  cleanSiteSourceCredentials,
  cleanSiteUserCredentials,
  getHeaders,
  actions,
}
