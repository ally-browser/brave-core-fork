/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "brave/browser/ui/views/brave_default_browser_dialog_view.h"

#include "base/logging.h"
#include "brave/browser/ui/browser_dialogs.h"
#include "brave/grit/brave_generated_resources.h"
#include "chrome/browser/ui/browser_window.h"
#include "components/constrained_window/constrained_window_views.h"
#include "ui/base/l10n/l10n_util.h"
#include "ui/views/controls/label.h"
#include "ui/views/layout/box_layout.h"

namespace brave {

void ShowDefaultBrowserDialog(Browser* browser) {
  constrained_window::CreateBrowserModalDialogViews(
      new BraveDefaultBrowserDialogView(browser->profile()),
      browser->window()->GetNativeWindow())->Show();
}

}  // namespace brave

BraveDefaultBrowserDialogView::BraveDefaultBrowserDialogView(
    Profile* profile)
    : profile_(profile) {
  DCHECK(profile_);
  SetButtonLabel(ui::DIALOG_BUTTON_OK,
                 l10n_util::GetStringUTF16(
                      IDS_BRAVE_DEFAULT_BROWSER_DIALOG_OK_BUTTON_LABEL));
  SetButtonLabel(ui::DIALOG_BUTTON_CANCEL,
                 l10n_util::GetStringUTF16(
                     IDS_BRAVE_DEFAULT_BROWSER_DIALOG_CANCEL_BUTTON_LABEL));

  constexpr int kChildSpacing = 16;
  constexpr int kBorderInsets = 24;
  SetLayoutManager(std::make_unique<views::BoxLayout>(
      views::BoxLayout::Orientation::kVertical,
      gfx::Insets(kBorderInsets), kChildSpacing));
  // Use 15px font size for header text.
  int size_diff = 15 - views::Label::GetDefaultFontList().GetFontSize();
  views::Label::CustomFont header_font = {
      views::Label::GetDefaultFontList()
          .DeriveWithSizeDelta(size_diff)
          .DeriveWithWeight(gfx::Font::Weight::SEMIBOLD)};
  auto* header = AddChildView(std::make_unique<views::Label>(
      l10n_util::GetStringUTF16(IDS_BRAVE_DEFAULT_BROWSER_DIALOG_HEADER_TEXT), header_font));
  header->SetHorizontalAlignment(gfx::ALIGN_LEFT);

  // Use 13px font size for contents text.
  size_diff = 13 - views::Label::GetDefaultFontList().GetFontSize();
  views::Label::CustomFont contents_font = {
      views::Label::GetDefaultFontList()
          .DeriveWithSizeDelta(size_diff)
          .DeriveWithWeight(gfx::Font::Weight::NORMAL)};
  auto* contents = AddChildView(std::make_unique<views::Label>(
      l10n_util::GetStringUTF16(IDS_BRAVE_DEFAULT_BROWSER_DIALOG_CONTENTS_TEXT), contents_font));
  contents->SetHorizontalAlignment(gfx::ALIGN_LEFT);
  contents->SetMultiLine(true);
  contents->SetMaxLines(3);
}

BraveDefaultBrowserDialogView::~BraveDefaultBrowserDialogView() = default;

// gfx::Size BraveDefaultBrowserDialogView::CalculatePreferredSize() const {
//   return { 400, 220 };
// }

ui::ModalType BraveDefaultBrowserDialogView::GetModalType() const {
  return ui::MODAL_TYPE_WINDOW;
}

bool BraveDefaultBrowserDialogView::ShouldShowCloseButton() const {
  return false;
}
