const http = require('http')
const { URL } = require('url')

const bodyParser = require('./helpers/bodyParser')
const routes = require('./routes')

const port = 3002

const server = http.createServer((request, response) => {
  const parsedUrl = new URL(`http://localhost:3002${request.url}`)

  let { pathname } = parsedUrl
  let id = null

  const endpoints = pathname.split('/').filter(Boolean)

  if(endpoints.length > 1) {
    pathname = `/${endpoints[0]}/:id`
    id = endpoints[1]
  }

  const params = { id }

  console.log(`Method: ${request.method} | Endpoint: ${pathname}`)

  const route = routes.find((routeObj) => (
    routeObj.endpoint === pathname && routeObj.method === request.method
  ))

  if(route) {
    request.query = Object.fromEntries(parsedUrl.searchParams)
    request.params = params

    response.send = (stateCode, body) => {
      response.writeHead(stateCode, { 'Content-Type': 'application/json' })
      response.end(JSON.stringify(body))
    }

    response.ok = () => response.send(200, { ok: true })

    if(['POST', 'PUT'].includes(request.method)) {
      bodyParser(request, () => {
        route.handler(request, response)
      })
    } else {
      route.handler(request, response)
    }
  } else {
    response.writeHead(404, { 'Content-Type': 'text/html' })
    response.end(`Cannot ${request.method} ${request.url}`)
  }

})


server.listen(port, () => console.log(`Server started at port ${port}`))