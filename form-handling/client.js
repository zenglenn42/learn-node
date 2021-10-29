//-------------------------------------------------------------------------
// client.js
//
// This client manages a simple two-parameter form and issues a fetch 
// against the form's server route when the submit button is clicked.
//-------------------------------------------------------------------------

function updateView(statusCode = "", statusText = "", objData = "", browserStatus = "") {

    let resultEl = document.getElementById("jsonDiv")
    if (resultEl) {
      if (typeof objData === 'object') {
        resultEl.innerHTML = JSON.stringify(objData, null, 2)
      } else {
        resultEl.innerHTML = objData
      }
    }

    let codeEl = document.getElementById("codeDiv")
    if (codeEl) {
      codeEl.innerHTML = statusCode
    }

    let textEl = document.getElementById("textDiv")
    if (textEl) {
      textEl.innerHTML = statusText
    }

    let clientEl = document.getElementById("browserStatusDiv")
    if (clientEl) {
      clientEl.innerHTML = browserStatus
    }
}

function submitForm(e) {
  let route = "/form"     // May also specify complete url.

  let status = ""
  let statusText = ""
  let browserStatus = ""

  let formEl = e.target
  if (formEl) {
    const data = new URLSearchParams()
    for (const pair of new FormData(formEl)) {
      data.append(pair[0], pair[1])
    }

    // Issue asynchronous request to server.

    fetch(route, {
        method: 'post',
        body: data,
        headers: {
          'Accept': 'application/json'}
    })
    .then((response) => { 

        status = response.status
        statusText = response.statusText
        return response.json() // Deserialize json string into js obj.

    }, (err) => { 

        // Client timeout because of ...
        //
        //    server or network outage
        //    cors violation
        //    https violation
        //    browser/network policy violations

        browserStatus = err
        let json = ""
        updateView(status, statusText, json, browserStatus)

    })
    .then((obj) => { 
        // On success (status == 200), obj.data contains the roundtrip
        // payload: {name: '..', age: #}

        updateView(status, statusText, obj, browserStatus)
    })
    .catch(
        // May be triggered by an 'abort' signal received by the fetch
        // request in response to a client-specified timeout. (See AbortController)

        () => { console.error('Fetch aborted.') }
    )
  }
  e.preventDefault()
}

function resetForm(e) {
  updateView()  // Clear server and client status area of view.
}
