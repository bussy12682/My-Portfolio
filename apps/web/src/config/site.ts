export const siteConfig = {
  name: "REKTINA.sub",
  developerBrand: "Permitt by REKTINA",
  tagline: "Top up. Send. Know what happened.",
  description:
    "Airtime and data for everyday life, and an email API for the products you build. Clear prices, traceable orders, one account.",
  /**
   * Links marked `planned` point at pages that are not built yet. They render in development
   * and are removed from production builds, so production never ships a dead link.
   */
  showPlannedLinks: process.env.NODE_ENV !== "production",
} as const;
