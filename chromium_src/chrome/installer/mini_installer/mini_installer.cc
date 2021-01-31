// Copyright (c) 2020 The Brave Authors
// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this file,
// you can obtain one at http://mozilla.org/MPL/2.0/.

#include "build/branding_buildflags.h"

#define BRAVE_RUN_SETUP                                                      \
  PathString installer_filename;                                             \
  wchar_t value[MAX_PATH] = {0, };                                           \
  const bool result =                                                        \
      RegKey::ReadSZValue(HKEY_CURRENT_USER,                                 \
                          L"Software\\BraveSoftware\\Promo",                 \
                          L"StubInstallerPath", value, _countof(value)) ;    \

#if defined(OFFICIAL_BUILD)
#undef BUILDFLAG_INTERNAL_GOOGLE_CHROME_BRANDING
#define BUILDFLAG_INTERNAL_GOOGLE_CHROME_BRANDING() (1)
#endif

#include "../../../../../chrome/installer/mini_installer/mini_installer.cc"

#undef BRAVE_RUN_SETUP

namespace mini_installer {

// Coverts a string in place to uppercase
void SafeStrASCIIUpper(wchar_t* str, size_t size) {
  if (!str || !size)
    return;

  for (size_t i = 0; i < size && str[i] != L'\0'; ++i) {
    wchar_t c = str[i];
    if (c >= L'a' && c <= L'z')
      str[i] += L'A' - L'a';
  }
}

}  // namespace mini_installer
