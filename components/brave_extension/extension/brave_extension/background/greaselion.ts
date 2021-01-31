/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

interface GreaselionError {
  errorMessage: string
}

interface OnAPIRequest {
  name: string
  url: string
  init: {}
}

interface MediaDurationMetadata {
  mediaKey: string
  duration: number
  firstVisit: boolean
}

interface RegisterOnCompletedWebRequest {
  urlPatterns: string[]
}

interface RegisterOnSendHeadersWebRequest {
  urlPatterns: string[]
  extra?: string[]
}

interface ConnectionState {
  port: chrome.runtime.Port
  onCompletedWebRequestListener?: (
    details: chrome.webRequest.WebResponseCacheDetails
  ) => void
  onSendHeadersWebRequestListener?: (
    details: chrome.webRequest.WebRequestHeadersDetails
  ) => void
  onUpdatedTabListener?: (
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab
  ) => void
}

// Maps Greaselion connection state by tabId:senderId
const connectionsByTabIdSenderId = new Map<string, ConnectionState>()

const buildTabIdSenderIdKey = (tabId: number, senderId: string) => {
  if (!tabId || !senderId) {
    return ''
  }

  return `${tabId}:${senderId}`
}

const handleGreaselionError = (tabId: number, mediaType: string, data: GreaselionError) => {
  console.error(`Greaselion error: ${data.errorMessage}`)
}

const handleOnAPIRequest = (data: OnAPIRequest, onSuccess: (response: any) => void, onFailure: (error: any) => void) => {
  if (!data || !data.url || !data.init || !onSuccess || !onFailure) {
    return
  }

  fetch(data.url, data.init)
    .then(response => {
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText} (${response.status})`)
      }

      return response.json()
    })
    .then(responseData => onSuccess(responseData))
    .catch(error => onFailure(error))
}

const onCompletedWebRequest = (
  registrationKey: string,
  mediaType: string,
  details: chrome.webRequest.WebResponseCacheDetails
) => {
  const connectionState = connectionsByTabIdSenderId.get(registrationKey)
  if (!connectionState || !connectionState.port) {
    return
  }
  connectionState.port.postMessage({
    type: 'OnCompletedWebRequest',
    mediaType,
    details
  })
}

const handleRegisterOnCompletedWebRequest = (
  registrationKey: string,
  mediaType: string,
  data: RegisterOnCompletedWebRequest
) => {
  const connectionState = connectionsByTabIdSenderId.get(registrationKey)
  if (!connectionState || connectionState.onCompletedWebRequestListener) {
    return
  }

  // Create and install the listener
  const listener = onCompletedWebRequest.bind(null, registrationKey, mediaType)
  chrome.webRequest.onCompleted.addListener(
    // Listener
    listener,
    // Filters
    {
      types: [
        'image',
        'media',
        'script',
        'xmlhttprequest'
      ],
      urls: data.urlPatterns
    })

  connectionState.onCompletedWebRequestListener = listener
}

const onSendHeadersWebRequest = (
  registrationKey: string,
  mediaType: string,
  details: chrome.webRequest.WebRequestHeadersDetails
) => {
  const connectionState = connectionsByTabIdSenderId.get(registrationKey)
  if (!connectionState || !connectionState.port) {
    return
  }
  connectionState.port.postMessage({
    type: 'OnSendHeadersWebRequest',
    mediaType,
    data: {
      details
    }
  })
}

const handleRegisterOnSendHeadersWebRequest = (registrationKey: string, mediaType: string, data: RegisterOnSendHeadersWebRequest) => {
  const connectionState = connectionsByTabIdSenderId.get(registrationKey)
  if (!connectionState || connectionState.onSendHeadersWebRequestListener) {
    return
  }

  // Create and install the listener
  const listener =
    onSendHeadersWebRequest.bind(null, registrationKey, mediaType)
  chrome.webRequest.onSendHeaders.addListener(
    // Listener
    listener,
    // Filters
    {
      urls: data.urlPatterns
    },
    // Extra
    data.extra
  )

  connectionState.onSendHeadersWebRequestListener = listener
}

const onUpdatedTab = (
  registrationKey: string,
  mediaType: string,
  tabId: number,
  changeInfo: chrome.tabs.TabChangeInfo,
  tab: chrome.tabs.Tab
) => {
  const connectionState = connectionsByTabIdSenderId.get(registrationKey)
  if (!connectionState || !connectionState.port) {
    return
  }
  connectionState.port.postMessage({
    type: 'OnUpdatedTab',
    mediaType,
    data: {
      tabId,
      changeInfo,
      tab
    }
  })
}

const handleRegisterOnUpdatedTab = (registrationKey: string, mediaType: string) => {
  const connectionState = connectionsByTabIdSenderId.get(registrationKey)
  if (!connectionState || connectionState.onUpdatedTabListener) {
    return
  }

  // Create and install the listener
  const listener = onUpdatedTab.bind(null, registrationKey, mediaType)
  chrome.tabs.onUpdated.addListener(listener)

  connectionState.onUpdatedTabListener = listener
}


const onMessageListener = (msg: any, port: chrome.runtime.Port) => {
  if (!port || !port.sender || !port.sender.id || !port.sender.tab || !msg) {
    return
  }

  const tabId = port.sender.tab.id
  if (!tabId) {
    return
  }

  const senderId = port.sender.id
  if (!senderId) {
    return
  }

  const key = buildTabIdSenderIdKey(tabId, senderId)
  if (!connectionsByTabIdSenderId.has(key)) {
    const connectionState = {
      port
    }
    connectionsByTabIdSenderId.set(key, connectionState)
  }

  chrome.greaselion.isGreaselionExtension(port.sender.id, (valid: boolean) => {
    if (!valid) {
      return
    }
    switch (msg.type) {
      case 'GreaselionError': {
        const data = msg.data as GreaselionError
        handleGreaselionError(tabId, msg.mediaType, data)
        break
      }
      case 'OnAPIRequest': {
        const data = msg.data as OnAPIRequest
        handleOnAPIRequest(
          data,
          (response: any) => {
            if (connectionsByTabIdSenderId.has(key)) {
              port.postMessage({
                type: 'OnAPIResponse',
                mediaType: msg.mediaType,
                data: {
                  name: data.name,
                  response
                }
              })
            }
          },
          (error: any) => {
            if (connectionsByTabIdSenderId.has(key)) {
              port.postMessage({
                type: 'OnAPIResponse',
                mediaType: msg.mediaType,
                data: {
                  name: data.name,
                  error
                }
              })
            }
          })
        break
      }
      case 'RegisterOnCompletedWebRequest': {
        const data = msg.data as RegisterOnCompletedWebRequest
        handleRegisterOnCompletedWebRequest(key, msg.mediaType, data)
        break
      }
      case 'RegisterOnSendHeadersWebRequest': {
        const data = msg.data as RegisterOnSendHeadersWebRequest
        handleRegisterOnSendHeadersWebRequest(key, msg.mediaType, data)
        break
      }
      case 'RegisterOnUpdatedTab': {
        handleRegisterOnUpdatedTab(key, msg.mediaType)
        break
      }
    }
  })
}

chrome.runtime.onConnectExternal.addListener((port: chrome.runtime.Port) => {
  if (!port || port.name !== 'Greaselion') {
    return
  }

  port.onMessage.addListener(onMessageListener)

  port.onDisconnect.addListener((port: chrome.runtime.Port) => {
    if (chrome.runtime.lastError) {
      console.error(`Greaselion port disconnected due to error: ${chrome.runtime.lastError}`)
    }
    if (port.sender && port.sender.id && port.sender.tab && port.sender.tab.id) {
      const key = buildTabIdSenderIdKey(port.sender.tab.id, port.sender.id)
      const connectionState = connectionsByTabIdSenderId.get(key)
      if (connectionState) {
        if (connectionState.onCompletedWebRequestListener) {
          chrome.webRequest.onCompleted.removeListener(
            connectionState.onCompletedWebRequestListener)
        }
        if (connectionState.onSendHeadersWebRequestListener) {
          chrome.webRequest.onSendHeaders.removeListener(
            connectionState.onSendHeadersWebRequestListener)
        }
        if (connectionState.onUpdatedTabListener) {
          chrome.tabs.onUpdated.removeListener(
            connectionState.onUpdatedTabListener)
        }
      }

      connectionsByTabIdSenderId.delete(key)

      port.onMessage.removeListener(onMessageListener)
    }
  })
})

chrome.runtime.onMessageExternal.addListener(
  function (msg: any, sender: chrome.runtime.MessageSender, sendResponse: any) {
    if (!msg || !msg.type || !sender || !sender.id) {
      return
    }
    chrome.greaselion.isGreaselionExtension(sender.id, (valid: boolean) => {
      if (!valid) {
        return
      }
      switch (msg.type) {
        case 'SupportsGreaselion':
          sendResponse({ supported: true })
          break
      }
    })
  })
