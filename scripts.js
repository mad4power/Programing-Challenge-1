const ref = 'MJS'
const logs = log => console.log(ref + ' ' + log)

const showHideElement = element => {
  logs('showHideElement')
  const $element = $(element)
  if ($element) {
    $('.actionFields .inputFields').children().hide()
    $element.show()
  }
}

const connectToAPI = ({ url, type, data }) => {
  logs('connectToAPI')
  return new Promise((resolve, reject) => {
    $.ajax({
      url,
      type,
      data,
      success: (response, status, data) => {
        const output = response ? response : { status }
        resolve(output)
      },
      error: (xhr, status, error) => {
        reject(xhr.responseJSON.error)
      }
    })
  })
}

const updateStatusBox = formattedHTML => {
  logs('updateStatusBox')
  const $statusText = $('.status')
  const contents = `
  <table>
    ${formattedHTML}
  </table>
  `
  $statusText.html(contents)
}

const formatResponse = response => {
  logs('formatResponse')
  let txt = ''
  for (x in response) {
    txt += `<tr><td>${x}</td><td>${response[x]}</td></tr>`
  }
  return txt
}

const formatGetResponse = response => {
  logs('formatGetResponse')
  return response.data.reduce((accumulator, currentValue) => {
    return accumulator += formatResponse(currentValue)
  }, '')
}

const formatResponseData = data => {
  const { type, response } = data
  if (type && response) {
    return formattedHTML = type === 'GET'
    ? formatGetResponse(response)
    : formatResponse(response)
  }
}

const apiAction = ({ request, type, data }) => {
  logs('apiAction')
  const apiData = {
    url: 'https://reqres.in/api/' + request,
    type: type
  }
  if (data) apiData.data = data
  return connectToAPI(apiData)
    .then(response => ({ type, response}))
}

const userAction = (action, data) => {
  logs('userAction')
  return new Promise(resolve => {
    switch (action) {
      case 'create':
        resolve({ request: 'users', type: 'POST', data })
        break
      case 'get':
        resolve({ request: 'users', type: 'GET' })
        break
      case 'update':
        const updateRequest = 'users/' + data.id
        resolve({ request: updateRequest, type: 'PATCH', data })
        break
      case 'delete':
        const deleteRequest = 'users/' + data.id
        resolve({ request: deleteRequest, type: 'DELETE' })
        break
      default:
        logs('Action not recognised')
    }
  })
}

const getInputData = () => {
  logs('getInputData')
  return data = {
    name: $('#name').val(),
    job: $('#job').val(),
    id: $('#id').val()
  }
}

const waitForUserSubmit = (action, $submitButton, callback) => {
  logs('waitForUserSubmit')
  $submitButton.off('click.submit')
  if (action === 'get') {
    callback(action)
  }
  $submitButton.on('click.submit', () => {
    console.log('submit click')
    const data = getInputData()
    callback(action, data)
  })
}

const resetInputFields = () => {
  logs('resetInputFields')
  $('#name').val('')
  $('#job').val('')
  $('#id').val('')
}

const waitForUserSelect = callback => {
  logs('waitForUserSelect')
  const $buttons = $('.buttonsContainer button')
  $buttons.on('click', ({ target }) => {
    if (target && target.dataset && target.dataset.action) {
      resetInputFields()
      updateStatusBox('Waiting for user')
      const action = target.dataset.action
      const $submitButton = $('.submit')
      $submitButton.show()
      if (action == 'get') {
        $submitButton.hide()
      }
      showHideElement('.actionFields')
      showHideElement('.' + action)
      waitForUserSubmit(action, $submitButton, callback)
    }
  })
}

const displayActions = () => {
  logs('displayActions')
  $('.waitForResponse').hide()
  showHideElement('.buttonsContainer')
}

const hasToken = ({ token }) => {
  logs('hasToken')
  if (!token || !token.length) {
    throw('Token is empty')
  }
}

const authorisationData = () => {
  logs('runScript')
  return {
    url: "https://reqres.in/api/login",
    type: "POST",
    data: {
      email: "eve.holt@reqres.in",
      password: "cityslicka"
    }
  }
}

const runScript = () => {
  logs('runScript')

  connectToAPI(authorisationData())
    .then(hasToken)
    .then(displayActions)
    .then(() => waitForUserSelect((action, data) => userAction(action, data)
      .then(apiAction)
      .then(formatResponseData)
      .then(updateStatusBox)
      .catch(error => logs(error))
    ))
    .catch(error => {
      updateStatusBox(error)
      logs(error)
    })

}

runScript()
