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
const BANNER = `Form server listening on port ${PORT} ...`
const MAX_AGE = 120

function validNameValue(name) {
  // Only allow alpha, period, dash, and space. Todo: Internalize
  // Examples: Joe, St. John, Mary-Jo
  return name.search(/[^a-z^.^-^ ]{1,}/i) == -1
}

function validAgeValue(age) {
  // Only allow ages 0-120. Reject on non-numeric characters.
  return (age.search(/[^0-9]{1,}/) == -1) && (parseInt(age) <= MAX_AGE)
}

function processFormData(req, res) {
  let body = ''
  let formData = {}
  let error = null

  req.on('readable', () => {
    let d = req.read()
    if (d) {
      if (typeof d === 'string') {
        body += d
      } else if (typeof d === 'object' && d instanceof Buffer) {
        body += d.toString('utf8')
      }
    }
  })

  req.on('end', () => {
    if (req.method.toLowerCase() === 'post') {
      formData = qs.parse(body) // formData = {name: value, age: value}
      let validName = validNameValue(formData.name)
      let validAge = validAgeValue(formData.age)
      console.log('  data:', JSON.stringify(formData))
      console.log('  valid name:', validName)
      console.log('  valid age: ', validAge)
      if (!validName || !validAge) {
        error = 'invalid_data'
      }
    }
    res.writeHead(200, {
      "Content-Type": "application/json"
    })
    res.end(JSON.stringify({error: error, data: formData}) + "\n")
  })
}

function serveStaticFile(fDir, fName, res) {
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

      // We only support 3 kinds of static files. :-)

      switch(fExt) {
        case "js":
          contentType = "text/javascript"
          break

        case "css":
          contentType = "text/css"
          break

        case "html":
          contentType = "text/html"
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
  let route = req.parsed_url.pathname               // Strips any trailing query string.
  console.log('Processing route', route)

  route = (route === "/") ? "/index.html" : route   // Alias '/' to index.html.
  switch(route) {

    // Whitelist only the essential static files for this demo.

    case "/index.html":
    case "/style.css":
    case "/client.js":
      let fDir = __dirname
      let fName = route
      serveStaticFile(fDir, fName, res)
      break

    // Process posted incoming form data in body.

    case "/form":
      processFormData(req, res)
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
      res.end(JSON.stringify({error: 'bad_request'}))

  }
}

let s = http.createServer(processIncomingRequest)
s.listen(PORT)
console.log(BANNER)
