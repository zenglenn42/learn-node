//-------------------------------------------------------------------------
// server.js
//
// A simple node.js web server that serves up a few static files
// and responds to posted form data.
//
// The processed data are validated and sent back down to the client as 
// serialized json, completing a round-trip.
//
// Usage: $ node server.js
//-------------------------------------------------------------------------

const fs   = require('fs')
const http = require('http')
const qs   = require('querystring')
const url  = require('url')

const PORT = 8080
const BANNER = `Template-driven UI app server listening on port ${PORT} ...`

function serveStaticFile(fDir, fName, fTemplate, res) {
  let fPath = `${fDir}${fName}`
  let fExt = fName.split(".").pop().toLowerCase()
  let contentType = undefined
  let contentObj = undefined
  if (fs.lstatSync(fPath).isFile()) {
    fs.readFile(fPath, function (err, data) {
      if (err) {
        res.writeHead(404)
        res.end(JSON.stringify(err))
        return
      }

      // We support 4 kinds of static files. :-)

      switch(fExt) {
        case "js":
          contentType = "text/javascript"
          break

        case "css":
          contentType = "text/css"
          break

        case "html":
          contentType = "text/html"
          data = data.toString('utf8')
          switch (fName) {
            case "/index.html":
            default:
              let pageTemplateJs = (fTemplate) ? fTemplate : 'home.js'
              data = data.replace('{{PAGE_NAME}}', pageTemplateJs) 
          }
          break

        case "json":
          contentType = "application/json"
          break
      }

      if (contentType) {
        res.writeHead(200, { "Content-Type": contentType })
        res.end(data)
      } else {
        res.writeHead(400, { "Content-Type": "application/json" })
        res.end(JSON.stringify({error: `${fExt}_mime_type_unsupported`}))
      }
    })
  } else {
    let fNameOnly = fName.split("/").pop() // Strip leading slash from route name.
    res.writeHead(404)
    res.end(JSON.stringify({error: `${fNameOnly}_not_found`}))
  }
}

function processIncomingRequest(req, res) {
  req.parsed_url = url.parse(req.url, true)
  let route = req.parsed_url.pathname      // Strips any trailing query string.
  console.log('Processing route', route)

  route = (route === "/") ? "/index.html" : route   // Alias '/' to index.html.
  let fDir = __dirname
  let fName = route
  let fTemplate = ""

  switch(route) {

    // Whitelist only the essential static files for this demo.

    case "/index.html":
    case "/client.js":
    case "/home.js":
    case "/mustache.js":
    case "/templates/home.html":
    case "/json/home.json":
      serveStaticFile(fDir, fName, fTemplate, res)
      break

    // Benignly ignore these silent browser requests.

    case "/favicon.ico":
    case "/apple-touch-icon.png":
    case "/apple-touch-icon-precomposed.png":
      res.writeHead(200)
      res.end(null)
      break

    // Conservatively reject all other requests.

    default:
      res.writeHead(400)
      res.end(JSON.stringify({error: `bad_request: ${route}`}))

  }
}

let s = http.createServer(processIncomingRequest)
s.listen(PORT)
console.log(BANNER)
