/* Copyright (c) 2019 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#ifndef BAT_ADS_INTERNAL_FREQUENCY_CAPPING_AD_NOTIFICATIONS_AD_NOTIFICATIONS_FREQUENCY_CAPPING_H_  // NOLINT
#define BAT_ADS_INTERNAL_FREQUENCY_CAPPING_AD_NOTIFICATIONS_AD_NOTIFICATIONS_FREQUENCY_CAPPING_H_  // NOLINT

#include "bat/ads/internal/ad_events/ad_event_info.h"

namespace ads {

struct CreativeAdInfo;

namespace ad_targeting {
namespace geographic {
class SubdivisionTargeting;
}  // namespace geographic
}  // namespace ad_targeting

namespace ad_notifications {

class FrequencyCapping {
 public:
  FrequencyCapping(
      ad_targeting::geographic::SubdivisionTargeting* subdivision_targeting,
      const AdEventList& ad_events);

  ~FrequencyCapping();

  FrequencyCapping(
      const FrequencyCapping&) = delete;
  FrequencyCapping& operator=(
      const FrequencyCapping&) = delete;

  bool IsAdAllowed();

  bool ShouldExcludeAd(
      const CreativeAdInfo& ad);

 private:
  ad_targeting::geographic::SubdivisionTargeting* subdivision_targeting_;

  AdEventList ad_events_;
};

}  // namespace ad_notifications
}  // namespace ads

#endif  // BAT_ADS_INTERNAL_FREQUENCY_CAPPING_AD_NOTIFICATIONS_AD_NOTIFICATIONS_FREQUENCY_CAPPING_H_  // NOLINT
