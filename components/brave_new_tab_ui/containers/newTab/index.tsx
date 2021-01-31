// Copyright (c) 2020 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at http://mozilla.org/MPL/2.0/.

import * as React from 'react'

// Components
import Stats from './stats'
import TopSitesGrid from './gridSites'
import FooterInfo from '../../components/default/footer/footer'
import SiteRemovalNotification from './notification'
import {
  ClockWidget as Clock,
} from '../../components/default'
import * as Page from '../../components/default/page'

// Types
import { getLocale } from '../../../common/locale'
import { NewTabActions } from '../../constants/new_tab_types'

// NTP features
import Settings, { TabType as SettingsTabType } from './settings'

interface Props {
  newTabData: NewTab.State
  gridSitesData: NewTab.GridSitesState
  actions: NewTabActions
  saveShowBackgroundImage: (value: boolean) => void
  saveShowStats: (value: boolean) => void
  saveSetAllStackWidgets: (value: boolean) => void
}

interface State {
  showSettingsMenu: boolean
  backgroundHasLoaded: boolean
  activeSettingsTab: SettingsTabType | null
}

function GetBackgroundImageSrc (props: Props) {
  if (!props.newTabData.showBackgroundImage) {
    return undefined
  }
  if (props.newTabData.backgroundImage && props.newTabData.backgroundImage.source) {
    return props.newTabData.backgroundImage.source
  }
  return undefined
}

class NewTabPage extends React.Component<Props, State> {
  state: State = {
    showSettingsMenu: false,
    backgroundHasLoaded: false,
    activeSettingsTab: null
  }
  imageSource?: string = undefined

  componentDidMount () {
    // if a notification is open at component mounting time, close it
    this.props.actions.showTilesRemovedNotice(false)
    this.imageSource = GetBackgroundImageSrc(this.props)
    this.trackCachedImage()
    this.checkShouldOpenSettings()
  }

  componentDidUpdate (prevProps: Props) {
    const oldImageSource = GetBackgroundImageSrc(prevProps)
    const newImageSource = GetBackgroundImageSrc(this.props)
    this.imageSource = newImageSource
    if (newImageSource && oldImageSource !== newImageSource) {
      this.trackCachedImage()
    }
    if (oldImageSource &&
      !newImageSource) {
      // reset loaded state
      this.setState({ backgroundHasLoaded: false })
    }
  }

  trackCachedImage () {
    if (this.state.backgroundHasLoaded) {
      this.setState({ backgroundHasLoaded: false })
    }
    if (this.imageSource) {
      const imgCache = new Image()
      imgCache.src = this.imageSource
      console.timeStamp('image start loading...')
      imgCache.onload = () => {
        console.timeStamp('image loaded')
        this.setState({
          backgroundHasLoaded: true
        })
      }
    }
  }

  checkShouldOpenSettings () {
    const params = window.location.search
    const urlParams = new URLSearchParams(params)
    const openSettings = urlParams.get('openSettings')

    if (openSettings) {
      this.setState({ showSettingsMenu: true })
      // Remove settings param so menu doesn't persist on reload
      window.history.pushState(null, '', '/')
    }
  }

  toggleShowBackgroundImage = () => {
    this.props.saveShowBackgroundImage(
      !this.props.newTabData.showBackgroundImage
    )
  }

  toggleShowClock = () => {
    this.props.actions.clockWidgetUpdated(
      !this.props.newTabData.showClock,
      this.props.newTabData.clockFormat)
  }

  toggleClockFormat = () => {
    const currentFormat = this.props.newTabData.clockFormat
    let newFormat
    // cycle through the available options
    switch (currentFormat) {
      case '': newFormat = '12'; break
      case '12': newFormat = '24'; break
      case '24': newFormat = ''; break
      default: newFormat = ''; break
    }
    this.props.actions.clockWidgetUpdated(
      this.props.newTabData.showClock,
      newFormat)
  }

  toggleShowStats = () => {
    this.props.saveShowStats(
      !this.props.newTabData.showStats
    )
  }

  toggleShowTopSites = () => {
    const { showTopSites, customLinksEnabled } = this.props.newTabData
    this.props.actions.setMostVisitedSettings(!showTopSites, customLinksEnabled)
  }

  toggleCustomLinksEnabled = () => {
    const { showTopSites, customLinksEnabled } = this.props.newTabData
    this.props.actions.setMostVisitedSettings(showTopSites, !customLinksEnabled)
  }

  closeSettings = () => {
    this.setState({
      showSettingsMenu: false,
      activeSettingsTab: null
    })
  }

  openSettings = (activeTab?: SettingsTabType) => {
    this.props.actions.customizeClicked()
    this.setState({
      showSettingsMenu: !this.state.showSettingsMenu,
      activeSettingsTab: activeTab || null
    })
  }

  openSettingsEditCards = () => {
    this.openSettings(SettingsTabType.Cards)
  }

  setForegroundStackWidget = (widget: NewTab.StackWidget) => {
    this.props.actions.setForegroundStackWidget(widget)
  }

  allWidgetsHidden = () => {
    const {
    } = this.props.newTabData
    return [
    ].every((widget: boolean) => !widget)
  }

  toggleAllCards = (show: boolean) => {
    if (!show) {
      this.props.actions.saveWidgetStackOrder()
      this.props.saveSetAllStackWidgets(false)
      return
    }

    const saveShowProps = {
    }

    const setAllTrue = (list: NewTab.StackWidget[]) => {
      list.forEach((widget: NewTab.StackWidget) => {
        if (widget in saveShowProps) {
          saveShowProps[widget](true)
        }
      })
    }

    const { savedWidgetStackOrder, widgetStackOrder } = this.props.newTabData
    // When turning back on, all widgets should be set to shown
    // in the case that all widgets were hidden previously.
    setAllTrue(
      !savedWidgetStackOrder.length ?
      widgetStackOrder :
      savedWidgetStackOrder
    )
  }


  render () {
    const { newTabData, gridSitesData, actions } = this.props
    const { showSettingsMenu } = this.state

    if (!newTabData) {
      return null
    }

    const hasImage = this.imageSource !== undefined
    const showTopSites = !!this.props.gridSitesData.gridSites.length && newTabData.showTopSites

    return (
      <Page.App
        dataIsReady={newTabData.initialDataLoaded}
        hasImage={hasImage}
        imageSrc={this.imageSource}
        imageHasLoaded={this.state.backgroundHasLoaded}
      >
        <Page.Page
            hasImage={hasImage}
            imageSrc={this.imageSource}
            imageHasLoaded={this.state.backgroundHasLoaded}
            showClock={newTabData.showClock}
            showStats={newTabData.showStats}
            showTopSites={showTopSites}
        >
          {newTabData.showStats &&
          <Page.GridItemStats>
            <Stats
              paddingType={'right'}
              widgetTitle={getLocale('statsTitle')}
              textDirection={newTabData.textDirection}
              stats={newTabData.stats}
              hideWidget={this.toggleShowStats}
              menuPosition={'right'}
            />
          </Page.GridItemStats>
          }
          {newTabData.showClock &&
          <Page.GridItemClock>
            <Clock
              paddingType={'right'}
              widgetTitle={getLocale('clockTitle')}
              textDirection={newTabData.textDirection}
              hideWidget={this.toggleShowClock}
              menuPosition={'left'}
              toggleClickFormat={this.toggleClockFormat}
              clockFormat={newTabData.clockFormat}
            />
          </Page.GridItemClock>
          }
          {
            showTopSites
              ? (
              <Page.GridItemTopSites>
                <TopSitesGrid
                  actions={actions}
                  paddingType={'right'}
                  customLinksEnabled={newTabData.customLinksEnabled}
                  widgetTitle={getLocale('topSitesTitle')}
                  gridSites={gridSitesData.gridSites}
                  menuPosition={'right'}
                  hideWidget={this.toggleShowTopSites}
                  textDirection={newTabData.textDirection}
                />
              </Page.GridItemTopSites>
              ) : null
          }
          {
            gridSitesData.shouldShowSiteRemovedNotification
            ? (
            <Page.GridItemNotification>
              <SiteRemovalNotification actions={actions} />
            </Page.GridItemNotification>
            ) : null
          }
          <Page.Footer>
            <Page.FooterContent>
            <FooterInfo
              textDirection={newTabData.textDirection}
              backgroundImageInfo={newTabData.backgroundImage}
              showPhotoInfo={newTabData.showBackgroundImage}
              onClickSettings={this.openSettings}
            />
            </Page.FooterContent>
          </Page.Footer>
        </Page.Page>
        <Settings
          actions={actions}
          textDirection={newTabData.textDirection}
          showSettingsMenu={showSettingsMenu}
          onClose={this.closeSettings}
          setActiveTab={this.state.activeSettingsTab || undefined}
          toggleShowBackgroundImage={this.toggleShowBackgroundImage}
          toggleShowClock={this.toggleShowClock}
          toggleShowStats={this.toggleShowStats}
          toggleShowTopSites={this.toggleShowTopSites}
          toggleCustomLinksEnabled={this.toggleCustomLinksEnabled}
          showBackgroundImage={newTabData.showBackgroundImage}
          showClock={newTabData.showClock}
          clockFormat={newTabData.clockFormat}
          showStats={newTabData.showStats}
          showTopSites={newTabData.showTopSites}
          customLinksEnabled={newTabData.customLinksEnabled}
          cardsHidden={this.allWidgetsHidden()}
          toggleCards={this.toggleAllCards}
        />
      </Page.App>
    )
  }
}

export default NewTabPage
