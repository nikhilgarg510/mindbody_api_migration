const http = require('https')
const parse = require('url-parse')
const soapRequest2 = ({
  endpoint,
  headers = {},
  xmls,
}) => {
  const url_info = parse(endpoint, true)
  const options = {
    method: 'POST',
    hostname: url_info.hostname,
    path: url_info.pathname,
    headers: {
      'Content-Type': 'text/xml; charset=utf-8',
      'Content-Length': Buffer.byteLength(xmls),
      ...headers,
    },
  };
  return new Promise((resolve) => {
    const req = http.request(options, (res) => {
      const chunks = []
      res.on('data', (chunk) => {
        chunks.push(chunk)
      })

      res.on('end', () => {
        const body = Buffer.concat(chunks)
        resolve(body.toString())
      })
    })

    req.write(xmls)
    req.end()
  })
}

module.exports = soapRequest2
