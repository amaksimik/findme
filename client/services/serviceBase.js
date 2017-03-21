'use strict'

import appController from '../core/appController'
import constants from '../../shared/constants'

const credentials = {
  credentials: 'same-origin'
}


async function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) return await response

  let error = new Error(response.statusText)
  error.response = await response.json()

  return Promise.reject(error)
}


function getJwtToken() {
  return appController.getJwt()
}

function getHeaders(url) {
  return url.includes('login') ? {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  } :
  {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'x-access-token': getJwtToken()
  }
}

function getUrl(url) {
  const timestamp = new Date().getTime()

  return `${constants.BASE_API_URL}${url}?t=${timestamp}`
}

/**
 * Base functionality for the server request communications (GET, POST, ...).
 * @type {{get: (function()), postPutDelete: (function()), post: (function()), put: (function()), delete: (function())}}
 */
const serviceBase = {

  get: async url => {
    credentials.headers = getHeaders(url)

    let response = await fetch(getUrl(url), credentials)
    response = await checkStatus(response)

    return response.json()
  },

  postPutDelete: async (url, method, request) => {
    const options = {
      headers: getHeaders(url),
      method: method,
      body: JSON.stringify(request)
    }

    let response = await fetch(getUrl(url), Object.assign(options, credentials))
    response = await checkStatus(response)

    return response.json()
  },

  post: (url, request) => serviceBase.postPutDelete(url, 'POST', request),

  put: async (url, request) => serviceBase.postPutDelete(url, 'PUT', request),

  delete: (url, request) => serviceBase.postPutDelete(url, 'DELETE', request)
}

export default serviceBase