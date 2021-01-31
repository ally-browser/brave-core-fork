/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#define wWinMain wWinMain_ChromiumImpl
#include "../../../../../chrome/installer/setup/setup_main.cc"
#undef wWinMain

int WINAPI wWinMain(HINSTANCE instance, HINSTANCE prev_instance,
                    wchar_t* command_line, int show_command) {
  int return_code = wWinMain_ChromiumImpl(instance, prev_instance, command_line,
                                          show_command);

  return return_code;
}
