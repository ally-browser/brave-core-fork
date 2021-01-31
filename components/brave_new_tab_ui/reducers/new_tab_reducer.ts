// Copyright (c) 2020 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at http://mozilla.org/MPL/2.0/.

import { Reducer } from 'redux'

// Constants
import { types } from '../constants/new_tab_types'
import { Stats } from '../api/stats'
import { PrivateTabData } from '../api/privateTabData'
import { TorTabData } from '../api/torTabData'

// API
import * as backgroundAPI from '../api/background'
import { InitialData } from '../api/initialData'
import * as preferencesAPI from '../api/preferences'
import * as storage from '../storage/new_tab_storage'
import { setMostVisitedSettings } from '../api/topSites'

// Utils
import { handleWidgetPrefsChange } from './stack_widget_reducer'

let sideEffectState: NewTab.State = storage.load()

type SideEffectFunction = (currentState: NewTab.State) => void

function performSideEffect (fn: SideEffectFunction): void {
  window.setTimeout(() => fn(sideEffectState), 0)
}

export const newTabReducer: Reducer<NewTab.State | undefined> = (state: NewTab.State, action) => {
  const payload = action.payload

  switch (action.type) {
    case types.NEW_TAB_SET_INITIAL_DATA:
      const initialDataPayload = payload as InitialData
      state = {
        ...state,
        initialDataLoaded: true,
        ...initialDataPayload.preferences,
        stats: initialDataPayload.stats,
        ...initialDataPayload.privateTabData,
        ...initialDataPayload.torTabData,
      }
      if (initialDataPayload.preferences.showBackgroundImage) {
        state.backgroundImage = backgroundAPI.randomBackgroundImage()
      }
      console.timeStamp('reducer initial data received')

      state = storage.addNewStackWidget(state)
      state = storage.replaceStackWidgets(state)

      break

    case types.NEW_TAB_STATS_UPDATED:
      const stats: Stats = payload.stats
      state = {
        ...state,
        stats
      }
      break

    case types.NEW_TAB_PRIVATE_TAB_DATA_UPDATED:
      const privateTabData = payload as PrivateTabData
      state = {
        ...state,
        useAlternativePrivateSearchEngine: privateTabData.useAlternativePrivateSearchEngine
      }
      break

    case types.NEW_TAB_TOR_TAB_DATA_UPDATED:
      const torTabData = payload as TorTabData
      state = {
        ...state,
        torCircuitEstablished: torTabData.torCircuitEstablished,
        torInitProgress: torTabData.torInitProgress
      }
      break

    case types.NEW_TAB_PREFERENCES_UPDATED:
      const preferences = payload as NewTab.Preferences
      const newState = {
        ...state,
        ...preferences
      }
      // We always show SR images regardless of background options state.
      // Get a new wallpaper image if turning that feature on
      const shouldChangeBackgroundImage =
        !state.showBackgroundImage && preferences.showBackgroundImage
      if (shouldChangeBackgroundImage) {
        newState.backgroundImage = backgroundAPI.randomBackgroundImage()
      }
      // Handle updated widget prefs
      state = handleWidgetPrefsChange(newState, state)
      break

    case types.UPDATE_CLOCK_WIDGET: {
      const { showClockWidget, clockFormat } = payload
      performSideEffect(async function (state) {
        preferencesAPI.saveShowClock(showClockWidget)
        preferencesAPI.saveClockFormat(clockFormat)
      })
      break
    }

    case types.SET_MOST_VISITED_SITES: {
      const { showTopSites, customLinksEnabled } = payload
      performSideEffect(async function (state) {
        setMostVisitedSettings(customLinksEnabled, showTopSites)
      })
      break
    }

    case types.TOP_SITES_STATE_UPDATED: {
      const { newShowTopSites, newCustomLinksEnabled } = payload
      state = {
        ...state,
        showTopSites: newShowTopSites,
        customLinksEnabled: newCustomLinksEnabled
      }
      break
    }

    case types.CUSTOMIZE_CLICKED: {
      performSideEffect(async function (state) {
        chrome.send('customizeClicked', [])
      })
      break
    }

    default:
      break
  }

  sideEffectState = state
  return state
}

export default newTabReducer
