/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/browser/ui/toolbar/brave_location_bar_model_delegate.h"

#include "base/strings/utf_string_conversions.h"
#include "brave/common/url_constants.h"
#include "chrome/browser/profiles/profile.h"
#include "chrome/browser/ui/browser.h"
#include "extensions/buildflags/buildflags.h"

BraveLocationBarModelDelegate::BraveLocationBarModelDelegate(Browser* browser) :
    BrowserLocationBarModelDelegate(browser) {}

BraveLocationBarModelDelegate::~BraveLocationBarModelDelegate() {}

// static
void BraveLocationBarModelDelegate::FormattedStringFromURL(const GURL& url,
    base::string16* new_formatted_url) {
  if (url.SchemeIs("chrome")) {
    base::ReplaceFirstSubstringAfterOffset(
        new_formatted_url,
        0,
        base::UTF8ToUTF16("chrome://"),
        base::UTF8ToUTF16("brave://"));
  }

}

base::string16
BraveLocationBarModelDelegate::FormattedStringWithEquivalentMeaning(
    const GURL& url,
    const base::string16& formatted_url) const {
  base::string16 new_formatted_url =
      BrowserLocationBarModelDelegate::FormattedStringWithEquivalentMeaning(
          url, formatted_url);
  BraveLocationBarModelDelegate::FormattedStringFromURL(url,
      &new_formatted_url);
  return new_formatted_url;
}
