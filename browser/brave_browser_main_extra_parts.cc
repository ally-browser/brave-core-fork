/* Copyright 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/browser/brave_browser_main_extra_parts.h"

#include "base/metrics/histogram_macros.h"
#include "brave/browser/brave_browser_process_impl.h"
#include "components/metrics/metrics_pref_names.h"
#include "components/prefs/pref_service.h"
#include "services/network/public/cpp/shared_url_loader_factory.h"

#if !defined(OS_ANDROID)
#include "brave/browser/ui/webui/new_tab_page/brave_new_tab_message_handler.h"
#include "chrome/browser/first_run/first_run.h"
#endif  // !defined(OS_ANDROID)

namespace {
}  // namespace

BraveBrowserMainExtraParts::BraveBrowserMainExtraParts() {
}

BraveBrowserMainExtraParts::~BraveBrowserMainExtraParts() {
}

void BraveBrowserMainExtraParts::PostBrowserStart() {
  g_brave_browser_process->StartBraveServices();
}

void BraveBrowserMainExtraParts::PreMainMessageLoopRun() {
  // Disabled on mobile platforms, see for instance issues/6176

  // The code below is not supported on android.
#if !defined(OS_ANDROID)
#endif  // !defined(OS_ANDROID)
}
