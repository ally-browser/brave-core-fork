import { select, boolean, number } from '@storybook/addon-knobs'
import { images } from '../../../data/backgrounds'
import { defaultTopSitesData } from '../../../data/defaultTopSites'
import { defaultState } from '../../../storage/new_tab_storage'
import { initialGridSitesState } from '../../../storage/grid_sites_storage'

function generateStaticImages (images: NewTab.Image[]) {
  const staticImages = {}
  for (const image of images) {
    Object.assign(staticImages, {
      [image.author]: {
        ...image,
        source: require('../../../../img/newtab/backgrounds/' + image.source)
      }
    })
  }
  return staticImages
}

function generateTopSites (topSites: typeof defaultTopSitesData) {
  const staticTopSites = []
  for (const [index, topSite] of topSites.entries()) {
    staticTopSites.push({
      ...topSite,
      title: topSite.name,
      letter: '',
      id: 'some-id-' + index,
      pinnedIndex: undefined,
      bookmarkInfo: undefined,
      defaultSRTopSite: false
    })
  }
  return staticTopSites
}

export const getNewTabData = (state: NewTab.State = defaultState): NewTab.State => ({
  ...state,
  backgroundImage: select(
    'Background image',
    generateStaticImages(images),
    generateStaticImages(images)['SpaceX']
  ),
  showBackgroundImage: boolean('Show background image?', true),
  showStats: boolean('Show stats?', true),
  showClock: boolean('Show clock?', true),
  showTopSites: boolean('Show top sites?', true),
  textDirection: select('Text direction', { ltr: 'ltr', rtl: 'rtl' } , 'ltr'),
  stats: {
    ...state.stats,
    adsBlockedStat: number('Number of blocked items', 1337),
    httpsUpgradesStat: number('Number of HTTPS upgrades', 1337)
  },
  initialDataLoaded: true,
  widgetStackOrder: []
})

export const getGridSitesData = (
  state: NewTab.GridSitesState = initialGridSitesState
) => ({
  ...state,
  gridSites: generateTopSites(defaultTopSitesData)
})
