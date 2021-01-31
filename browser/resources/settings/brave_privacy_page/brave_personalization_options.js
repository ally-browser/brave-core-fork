/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

(function() {
'use strict';

Polymer({
  is: 'settings-brave-personalization-options',

  behaviors: [
    WebUIListenerBehavior,
  ],

  properties: {
    webRTCPolicies_: {
      readOnly: true,
      type: Array,
      value: function() {
        return [
          {value: 'default', name: loadTimeData.getString('webRTCDefault')},
          {value: 'default_public_and_private_interfaces', name: loadTimeData.getString('defaultPublicAndPrivateInterfaces')},
          {value: 'default_public_interface_only', name: loadTimeData.getString('defaultPublicInterfaceOnly')},
          {value: 'disable_non_proxied_udp', name: loadTimeData.getString('disableNonProxiedUdp')}
        ]
      },
    },

    webRTCPolicy_: String,
  },

  /** @private {?settings.BravePrivacyBrowserProxy} */
  browserProxy_: null,

  /** @override */
  created: function() {
    this.browserProxy_ = settings.BravePrivacyBrowserProxyImpl.getInstance();
  },

  /** @override */
  ready: function() {
    // Used for first time initialization of checked state.
  },

  shouldShowRestart_: function(enabled) {
    return enabled != this.browserProxy_.wasPushMessagingEnabledAtStartup();
  },

  restartBrowser_: function(e) {
    e.stopPropagation();
    window.open("chrome://restart", "_self");
  },

});
})();
