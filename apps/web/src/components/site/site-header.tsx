"use client";

import { AnnouncementBar } from "@rektinasub/ui/components/announcement";
import { NavigationHeader } from "@rektinasub/ui/components/navigation";
import { Wordmark } from "@/components/brand/wordmark";
import { homeContent } from "@/config/home";
import { navigationConfig } from "@/config/navigation";
import { siteConfig } from "@/config/site";

// Client component because the config holds icon components, which cannot cross the server boundary.
export function SiteHeader() {
  return (
    <>
      <AnnouncementBar {...homeContent.announcement} showPlanned={siteConfig.showPlannedLinks} />
      <NavigationHeader
        config={navigationConfig}
        brand={<Wordmark />}
        showPlanned={siteConfig.showPlannedLinks}
      />
    </>
  );
}
