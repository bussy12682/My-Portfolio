import { Footer } from "@rektinasub/ui/components/footer";
import { Wordmark } from "@/components/brand/wordmark";
import { footerConfig } from "@/config/footer";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <Footer config={footerConfig} brand={<Wordmark />} showPlanned={siteConfig.showPlannedLinks} />
  );
}
