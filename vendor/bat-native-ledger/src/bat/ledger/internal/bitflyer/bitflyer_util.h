/* Copyright (c) 2021 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BRAVELEDGER_BITFLYER_BITFLYER_UTIL_H_
#define BRAVELEDGER_BITFLYER_BITFLYER_UTIL_H_

#include <map>
#include <string>
#include <vector>

#include "bat/ledger/ledger.h"

namespace ledger {
class LedgerImpl;

namespace bitflyer {

const char kUrlStaging[] = "https://sandbox.uphold.com";
const char kUrlProduction[] = "https://uphold.com";
const char kClientIdStaging[] = "4c2b665ca060d912fec5c735c734859a06118cc8";
const char kClientIdProduction[] = "6d8d9473ed20be627f71ed46e207f40c004c5b1a";
const char kFeeAddressStaging[] = "1b2b466f-5c15-49bf-995e-c91777d3da93";
const char kFeeAddressProduction[] = "b01e8c55-5004-4761-9e4b-01ec13e25c92";
const char kACAddressStaging[] = "1b2b466f-5c15-49bf-995e-c91777d3da93";
const char kACAddressProduction[] = "b01e8c55-5004-4761-9e4b-01ec13e25c92";

std::string GetClientId();

std::string GetUrl();

std::string GetFeeAddress();

std::string GetACAddress();

std::string GetAuthorizeUrl(const std::string& state, const bool kyc_flow);

std::string GetAddUrl(const std::string& address);

std::string GetWithdrawUrl(const std::string& address);

std::string GetSecondStepVerify();

type::BitflyerWalletPtr GetWallet(LedgerImpl* ledger);

bool SetWallet(LedgerImpl* ledger, type::BitflyerWalletPtr wallet);

std::string GenerateRandomString(bool testing);

std::string GetAccountUrl();

type::BitflyerWalletPtr GenerateLinks(type::BitflyerWalletPtr wallet);

std::string GenerateVerifyLink(type::BitflyerWalletPtr wallet);

type::BitflyerWalletPtr ResetWallet(type::BitflyerWalletPtr wallet);

}  // namespace bitflyer
}  // namespace ledger

#endif  // BRAVELEDGER_BITFLYER_BITFLYER_UTIL_H_
