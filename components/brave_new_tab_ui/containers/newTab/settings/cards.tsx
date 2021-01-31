// Copyright (c) 2020 The Brave Authors. All rights reserved.
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at http://mozilla.org/MPL/2.0/.

import * as React from 'react'

import {
  FeaturedSettingsWidget,
  StyledWidgetToggle,
  StyledAddButtonIcon,
  StyledHideButtonIcon,
  StyledWidgetSettings,
  StyledButtonLabel,
  ToggleCardsWrapper,
  ToggleCardsTitle,
  ToggleCardsCopy,
  ToggleCardsSwitch,
  ToggleCardsText
} from '../../../components/default'
import HideIcon from './assets/hide-icon'
import { Toggle } from '../../../components/toggle'
import { PlusIcon } from 'brave-ui/components/icons'

import { getLocale } from '../../../../common/locale'

interface Props {
  toggleCards: (show: boolean) => void
  cardsHidden: boolean
}

class CardsSettings extends React.PureComponent<Props, {}> {

  renderToggleButton = (on: boolean, toggleFunc: any, float: boolean = true) => {
    const ButtonContainer = on ? StyledHideButtonIcon : StyledAddButtonIcon
    const ButtonIcon = on ? HideIcon : PlusIcon

    return (
      <StyledWidgetToggle
        isAdd={!on}
        float={float}
        onClick={toggleFunc}
      >
        <ButtonContainer>
          <ButtonIcon />
        </ButtonContainer>
        <StyledButtonLabel>
          {
            on
            ? getLocale('hideWidget')
            : getLocale('addWidget')
          }
        </StyledButtonLabel>
      </StyledWidgetToggle>
    )
  }

  render () {
    const {
      toggleCards,
      cardsHidden
    } = this.props
    return (
      <StyledWidgetSettings>
        <FeaturedSettingsWidget>
          <ToggleCardsWrapper>
            <ToggleCardsText>
              <ToggleCardsTitle>
                {getLocale('cardsToggleTitle')}
              </ToggleCardsTitle>
              <ToggleCardsCopy>
                {getLocale('cardsToggleDesc')}
              </ToggleCardsCopy>
            </ToggleCardsText>
            <ToggleCardsSwitch>
              <Toggle
                size={'large'}
                onChange={toggleCards.bind(this, cardsHidden)}
                checked={!cardsHidden}
              />
            </ToggleCardsSwitch>
          </ToggleCardsWrapper>
        </FeaturedSettingsWidget>
      </StyledWidgetSettings>
    )
  }
}

export default CardsSettings
