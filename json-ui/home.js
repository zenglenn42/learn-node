document.addEventListener('DOMContentLoaded', () => {
  let banner = "Hello, I was built dynamically from <h2>home.js</h2>"

  // Load HTML template.

  let templateRqstUrl = "/templates/home.html"
  let rqstConfig = {
    method: 'GET'
  }
  fetch(templateRqstUrl, rqstConfig)
  .then(
    (response) => {
      if (response.status == 200) {
        console.log('fetch of /templates/home.html succeeded')
        return response.text()
      } else {
        console.log('fetch of /templates/home.html failed')
      }
    },
    (err) => {
      console.log('Failed fetch of /templates/home.html.  Network down?')
      console.log('err:', err)
    }
  ).then(
    (htmlTemplate) => {
      let jsonRqstUrl = "/json/home.json"
      let jsonRqstConfig = {
        method: 'GET'
      }
      fetch(jsonRqstUrl, rqstConfig)
      .then(
        (response) => {
          if (response.status == 200) {
            console.log('fetch of /json/home.json succeeded')
            return response.json()
          } else {
            console.log('fetch of /json/home.json failed')
          }
        },
        (err) => {
          console.log('Failed fetch of /json/home.json.  Network down?')
          console.log('err:', err)
        }
      ).then((jsObj) => {
        console.log('yay gotta jsObj', JSON.stringify(jsObj, null, 2))
        let bodyEl = document.querySelector("body")
        if (bodyEl) {
          if (htmlTemplate) {
            bodyEl.innerHTML = Mustache.render(htmlTemplate, jsObj)
          } else {
            bodyEl.innerHTML = banner
          }
        }
      })
    }
  )
})
