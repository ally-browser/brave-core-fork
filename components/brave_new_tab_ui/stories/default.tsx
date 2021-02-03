/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import * as React from 'react'
import { Dispatch } from 'redux'
import { Provider as ReduxProvider } from 'react-redux'
import { storiesOf } from '@storybook/react'
import { withKnobs, select, boolean } from '@storybook/addon-knobs'
import Theme from 'brave-ui/theme/brave-default'
import DarkTheme from 'brave-ui/theme/brave-dark'
import BraveCoreThemeProvider from '../../common/BraveCoreThemeProvider'

// Components
import NewTabPage from '../containers/newTab'
import { getActionsForDispatch } from '../api/getActions'
import store from '../store'
import { getNewTabData, getGridSitesData } from './default/data/storybookState'

const doNothingDispatch: Dispatch = (action: any) => action

function getActions () {
  return getActionsForDispatch(doNothingDispatch)
}

// @ts-ignore
window.braveStorybookUnpadUrl = async function UnpadUrl (paddedUrl: string, mimeType = 'image/jpg'): Promise<string> {
  const response = await fetch(paddedUrl)
  const blob = await response.blob()
  // @ts-ignore (Blob.arrayBuffer does exist)
  const buffer = await blob.arrayBuffer()
  const dataUrl = await getUnpaddedAsDataUrl(buffer, mimeType)
  return dataUrl
}

function ThemeProvider ({ story }: any) {
  return (
    <BraveCoreThemeProvider
      dark={DarkTheme}
      light={Theme}
      initialThemeType={select(
        'Theme',
        { ['Light']: 'Light', ['Dark']: 'Dark' },
        'Light'
      )}
    >
    {story}
    </BraveCoreThemeProvider>
  )
}

function StoreProvider ({ story }: any) {
  return (
    <ReduxProvider store={store}>
     {story}
    </ReduxProvider>
  )
}

storiesOf('New Tab/Containers', module)
  .addDecorator(withKnobs)
  .addDecorator(story => <div dir={boolean('rtl?', false) ? 'rtl' : ''}>{story()}</div>)
  .addDecorator(story => <StoreProvider story={story()} />)
  .addDecorator(story => <ThemeProvider story={story()} />)
  .add('Default', () => {
    const doNothing = (value: boolean) => value
    const state = store.getState()
    const newTabData = getNewTabData(state.newTabData)
    const gridSitesData = getGridSitesData(state.gridSitesData)
    return (
      <NewTabPage
        newTabData={newTabData}
        gridSitesData={gridSitesData}
        actions={getActions()}
        saveShowBackgroundImage={doNothing}
        saveShowStats={doNothing}
        saveSetAllStackWidgets={doNothing}
      />
    )
  })
