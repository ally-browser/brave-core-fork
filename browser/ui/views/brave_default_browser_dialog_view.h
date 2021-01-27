/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVE_BROWSER_UI_VIEWS_BRAVE_DEFAULT_BROWSER_DIALOG_VIEW_H_
#define BRAVE_BROWSER_UI_VIEWS_BRAVE_DEFAULT_BROWSER_DIALOG_VIEW_H_

#include "ui/views/window/dialog_delegate.h"

class Profile;

class BraveDefaultBrowserDialogView : public views::DialogDelegateView {
 public:
  explicit BraveDefaultBrowserDialogView(Profile* profile);
  ~BraveDefaultBrowserDialogView() override;

  BraveDefaultBrowserDialogView(const BraveDefaultBrowserDialogView&) = delete;
  BraveDefaultBrowserDialogView& operator=(
      const BraveDefaultBrowserDialogView&) = delete;

  // views::DialogDelegateView overrides:
  // gfx::Size CalculatePreferredSize() const override;
  ui::ModalType GetModalType() const override;
  bool ShouldShowCloseButton() const override;

 private:
  Profile* profile_ = nullptr;
};

#endif  // BRAVE_BROWSER_UI_VIEWS_BRAVE_DEFAULT_BROWSER_DIALOG_VIEW_H_
