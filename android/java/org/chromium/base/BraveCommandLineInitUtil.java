/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.chromium.base;

import android.content.SharedPreferences;

import androidx.annotation.Nullable;

import org.chromium.base.ContextUtils;
import org.chromium.base.supplier.Supplier;

import java.util.ArrayList;

public abstract class BraveCommandLineInitUtil {
    // Duplicate constant to avoid pull dependancy into base
    private static final String PREF_QA_COMMAND_LINE = "qa_command_line";

    public static void initCommandLine(String fileName) {
        SharedPreferences sharedPreferences = ContextUtils.getAppSharedPreferences();
        String qaCommandLine = sharedPreferences.getString(PREF_QA_COMMAND_LINE, "");
        String[] args = CommandLine.tokenizeQuotedArguments(qaCommandLine.toCharArray());
        CommandLine.init(args == null ? null : args);
    }

    public static void initCommandLine(
            String fileName, @Nullable Supplier<Boolean> shouldUseDebugFlags) {
        initCommandLine(fileName);
    }
}
