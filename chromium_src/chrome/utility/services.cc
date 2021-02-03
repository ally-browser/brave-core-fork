/* Copyright (c) 2020 The Brave Authors. All rights reserved.
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

#include "build/build_config.h"
#include "brave/components/ipfs/buildflags/buildflags.h"
#include "brave/components/tor/buildflags/buildflags.h"

#if !defined(OS_ANDROID)
#include "brave/utility/importer/brave_profile_import_impl.h"
#endif

#if BUILDFLAG(IPFS_ENABLED)
#include "brave/components/services/ipfs/ipfs_service_impl.h"
#include "brave/components/services/ipfs/public/mojom/ipfs_service.mojom.h"
#endif

#if BUILDFLAG(ENABLE_TOR)
#include "brave/components/services/tor/public/interfaces/tor.mojom.h"
#include "brave/components/services/tor/tor_launcher_impl.h"
#endif

namespace {

#if !defined(OS_ANDROID)
auto RunBraveProfileImporter(
    mojo::PendingReceiver<brave::mojom::ProfileImport> receiver) {
  return std::make_unique<BraveProfileImportImpl>(std::move(receiver));
}
#endif

#if BUILDFLAG(IPFS_ENABLED)
auto RunIpfsService(mojo::PendingReceiver<ipfs::mojom::IpfsService> receiver) {
  return std::make_unique<ipfs::IpfsServiceImpl>(std::move(receiver));
}
#endif

#if BUILDFLAG(ENABLE_TOR)
auto RunTorLauncher(mojo::PendingReceiver<tor::mojom::TorLauncher> receiver) {
  return std::make_unique<tor::TorLauncherImpl>(std::move(receiver));
}
#endif

}  // namespace

#if defined(OS_ANDROID)
#define BRAVE_PROFILE_IMPORTER
#else
#define BRAVE_PROFILE_IMPORTER services.Add(RunBraveProfileImporter);
#endif

#if BUILDFLAG(IPFS_ENABLED)
#define BRAVE_IPFS_SERVICE services.Add(RunIpfsService);
#else
#define BRAVE_IPFS_SERVICE
#endif

#if BUILDFLAG(ENABLE_TOR)
#define BRAVE_TOR_LAUNCHER services.Add(RunTorLauncher);
#else
#define BRAVE_TOR_LAUNCHER
#endif

#define BRAVE_GET_MAIN_THREAD_SERVICE_FACTORY \
    BRAVE_PROFILE_IMPORTER \
    BRAVE_IPFS_SERVICE \
    BRAVE_TOR_LAUNCHER

#include "../../../../chrome/utility/services.cc"

#undef BRAVE_GET_MAIN_THREAD_SERVICE_FACTORY
#undef BRAVE_PROFILE_IMPORTER
#undef BRAVE_IPFS_SERVICE
#undef BRAVE_TOR_LAUNCHER
