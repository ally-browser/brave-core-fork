/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

package org.chromium.chrome.browser.settings.developer;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.text.InputType;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnFocusChangeListener;
import android.view.inputmethod.InputMethodManager;
import android.widget.EditText;
import android.widget.Toast;

import androidx.preference.Preference;
import androidx.preference.Preference.OnPreferenceChangeListener;

import org.chromium.base.ContextUtils;
import org.chromium.base.FileUtils;
import org.chromium.base.Log;
import org.chromium.base.annotations.CalledByNative;
import org.chromium.chrome.R;
import org.chromium.chrome.browser.BraveConfig;
import org.chromium.chrome.browser.BraveRelaunchUtils;
import org.chromium.chrome.browser.preferences.BravePrefServiceBridge;
import org.chromium.chrome.browser.settings.BravePreferenceFragment;
import org.chromium.components.browser_ui.settings.ChromeSwitchPreference;
import org.chromium.components.browser_ui.settings.SettingsUtils;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;

/**
 * Settings fragment containing preferences for QA team.
 */
public class BraveQAPreferences extends BravePreferenceFragment
    implements OnPreferenceChangeListener {
    private static final String PREF_USE_SYNC_STAGING_SERVER = "use_sync_staging_server";
    private static final String PREF_QA_DEBUG_NTP = "qa_debug_ntp";
    private static final String PREF_QA_COMMAND_LINE = "qa_command_line";

    private static final int CHOOSE_FILE_FOR_IMPORT_REQUEST_CODE = STORAGE_PERMISSION_IMPORT_REQUEST_CODE + 1;

    private ChromeSwitchPreference mIsSyncStagingServer;
    private ChromeSwitchPreference mDebugNTP;
    private Preference mCommandLine;

    private String mFileToImport;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        SettingsUtils.addPreferencesFromResource(this, R.xml.qa_preferences);

        mIsSyncStagingServer =
                (ChromeSwitchPreference) findPreference(PREF_USE_SYNC_STAGING_SERVER);
        if (mIsSyncStagingServer != null) {
            mIsSyncStagingServer.setOnPreferenceChangeListener(this);
        }
        mIsSyncStagingServer.setChecked(isSyncStagingUsed());

        mDebugNTP = (ChromeSwitchPreference) findPreference(PREF_QA_DEBUG_NTP);
        if (mDebugNTP != null) {
            mDebugNTP.setOnPreferenceChangeListener(this);
        }

        mCommandLine = findPreference(PREF_QA_COMMAND_LINE);
        setCommandLineClickListener();

        checkQACode();
    }

    private void setCommandLineClickListener() {
        if (mCommandLine == null) {
            return;
        }
        mCommandLine.setOnPreferenceClickListener(preference -> {
            LayoutInflater inflater = (LayoutInflater) getActivity().getSystemService(
                    Context.LAYOUT_INFLATER_SERVICE);
            View view = inflater.inflate(R.layout.qa_command_line, null);
            final EditText input = (EditText) view.findViewById(R.id.qa_command_line);

            input.setText(getPreferenceString(PREF_QA_COMMAND_LINE));

            DialogInterface.OnClickListener onClickListener =
                    new DialogInterface.OnClickListener() {
                        @Override
                        public void onClick(DialogInterface dialog, int button) {
                            if (button == AlertDialog.BUTTON_POSITIVE) {
                                // OK was pressed
                                String newCommandLine = input.getText().toString();
                                setPreferenceString(PREF_QA_COMMAND_LINE, newCommandLine);
                                BraveRelaunchUtils.askForRelaunch(getActivity());
                            }
                        }
                    };

            input.setOnFocusChangeListener(new OnFocusChangeListener() {
                @Override
                public void onFocusChange(View v, boolean hasFocus) {
                    input.post(new Runnable() {
                        @Override
                        public void run() {
                            InputMethodManager inputMethodManager =
                                    (InputMethodManager) getActivity().getSystemService(
                                            Context.INPUT_METHOD_SERVICE);
                            inputMethodManager.showSoftInput(
                                    input, InputMethodManager.SHOW_IMPLICIT);
                        }
                    });
                }
            });
            input.requestFocus();

            AlertDialog.Builder alert =
                    new AlertDialog.Builder(getActivity(), R.style.Theme_Chromium_AlertDialog);
            if (alert == null) {
                return true;
            }
            AlertDialog.Builder alertDialog =
                    alert.setTitle("Enter Command Line string")
                            .setView(view)
                            .setPositiveButton(R.string.ok, onClickListener)
                            .setNegativeButton(R.string.cancel, onClickListener)
                            .setCancelable(false);
            Dialog dialog = alertDialog.create();
            dialog.setCanceledOnTouchOutside(false);
            dialog.show();

            return true;
        });
    }

    @Override
    public void onStart() {
        super.onStart();
    }

    @Override
    public void onStop() {
        super.onStop();
    }

    @Override
    public boolean onPreferenceChange(Preference preference, Object newValue) {
        if (PREF_QA_DEBUG_NTP.equals(preference.getKey())
                || PREF_USE_SYNC_STAGING_SERVER.equals(preference.getKey())) {
            setOnPreferenceValue(preference.getKey(), (boolean)newValue);
            BraveRelaunchUtils.askForRelaunch(getActivity());
        }
        return true;
    }

    private static void setOnPreferenceValue(String preferenceName, boolean newValue) {
        SharedPreferences sharedPreferences = ContextUtils.getAppSharedPreferences();
        SharedPreferences.Editor sharedPreferencesEditor = sharedPreferences.edit();
        sharedPreferencesEditor.putBoolean(preferenceName, newValue);
        sharedPreferencesEditor.apply();
    }

    private static boolean getPreferenceValue(String preferenceName) {
        SharedPreferences sharedPreferences = ContextUtils.getAppSharedPreferences();
        return sharedPreferences.getBoolean(preferenceName, false);
    }

    private static void setPreferenceString(String preferenceName, String newValue) {
        SharedPreferences sharedPreferences = ContextUtils.getAppSharedPreferences();
        SharedPreferences.Editor sharedPreferencesEditor = sharedPreferences.edit();
        sharedPreferencesEditor.putString(preferenceName, newValue);
        sharedPreferencesEditor.apply();
    }

    private static String getPreferenceString(String preferenceName) {
        SharedPreferences sharedPreferences = ContextUtils.getAppSharedPreferences();
        return sharedPreferences.getString(preferenceName, "");
    }

    @CalledByNative
    public static boolean isSyncStagingUsed() {
        return getPreferenceValue(PREF_USE_SYNC_STAGING_SERVER);
    }

    private void checkQACode() {
        LayoutInflater inflater =
            (LayoutInflater) getActivity().getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        View view = inflater.inflate(R.layout.qa_code_check, null);
        final EditText input = (EditText) view.findViewById(R.id.qa_code);

        DialogInterface.OnClickListener onClickListener = new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int button) {
                if (button != AlertDialog.BUTTON_POSITIVE
                        || !input.getText().toString().equals(BraveConfig.DEVELOPER_OPTIONS_CODE)) {
                    getActivity().finish();
                }
            }
        };

        input.setOnFocusChangeListener(new OnFocusChangeListener() {
            @Override
            public void onFocusChange(View v, boolean hasFocus) {
                input.post(new Runnable() {
                    @Override
                    public void run() {
                        InputMethodManager inputMethodManager =
                            (InputMethodManager) getActivity().getSystemService(
                                Context.INPUT_METHOD_SERVICE);
                        inputMethodManager.showSoftInput(input, InputMethodManager.SHOW_IMPLICIT);
                    }
                });
            }
        });
        input.requestFocus();

        AlertDialog.Builder alert =
            new AlertDialog.Builder(getActivity(), R.style.Theme_Chromium_AlertDialog);
        if (alert == null) {
            return;
        }
        AlertDialog.Builder alertDialog = alert
                                          .setTitle("Enter QA code")
                                          .setView(view)
                                          .setPositiveButton(R.string.ok, onClickListener)
                                          .setNegativeButton(R.string.cancel, onClickListener)
                                          .setCancelable(false);
        Dialog dialog = alertDialog.create();
        dialog.setCanceledOnTouchOutside(false);
        dialog.show();
    }

    @Override
    public void OnResetTheWholeState(boolean success) {
        if (success) {
            BraveRelaunchUtils.askForRelaunch(getActivity());
        }
    }

    @Override
    public void onCreatePreferences(Bundle bundle, String s) {}

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
            if (STORAGE_PERMISSION_EXPORT_REQUEST_CODE == requestCode) {
                requestRestart(false);
            } else if (STORAGE_PERMISSION_IMPORT_REQUEST_CODE == requestCode) {
                requestRestart(true);
            }
        }
    }

    @Override
    public void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
    }

    private void requestRestart(boolean isImport) {
        DialogInterface.OnClickListener onClickListener = new DialogInterface.OnClickListener() {
            @Override
            public void onClick(DialogInterface dialog, int button) {
                if (button == AlertDialog.BUTTON_POSITIVE) {
                    BraveRelaunchUtils.restart();
                } else {
                }
            }
        };
        AlertDialog.Builder alertDialog = new AlertDialog.Builder(getActivity(), R.style.Theme_Chromium_AlertDialog)
        .setMessage(
            "This operation requires restart. Would you like to restart application and start operation?")
        .setPositiveButton(R.string.ok, onClickListener).setNegativeButton(R.string.cancel, onClickListener);
        Dialog dialog = alertDialog.create();
        dialog.setCanceledOnTouchOutside(false);
        dialog.show();
    }
}
