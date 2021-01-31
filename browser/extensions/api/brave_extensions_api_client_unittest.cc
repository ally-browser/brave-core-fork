/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at https://mozilla.org/MPL/2.0/. */

#include <string>

#include "brave/browser/extensions/api/brave_extensions_api_client.h"
#include "chrome/test/base/chrome_render_view_host_test_harness.h"
#include "extensions/browser/api/web_request/web_request_info.h"
#include "testing/gtest/include/gtest/gtest.h"
#include "url/gurl.h"

namespace extensions {

class BraveExtensionsAPIClientTests : public ChromeRenderViewHostTestHarness {
 public:
  bool ShouldHideBrowserNetworkRequest(const WebRequestInfo& request_info) {
    return client_.ShouldHideBrowserNetworkRequest(browser_context(),
                                                   request_info);
  }

 protected:
  BraveExtensionsAPIClientTests() = default;

 private:
  BraveExtensionsAPIClient client_;

  DISALLOW_COPY_AND_ASSIGN(BraveExtensionsAPIClientTests);
};


}  // namespace extensions
