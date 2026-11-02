/**
 * Every image and video the app shows, in one registry. Entries marked `placeholder` are
 * Unsplash stand-ins; replace `src` when final assets arrive. Marketing pages prefer product
 * previews (`components/site/previews.tsx`) over photography.
 */
type Media = { src: string; alt: string; placeholder: boolean };

const unsplash = (id: string, width = 1600) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

export const media = {
  developerWorkspace: {
    src: unsplash("photo-1498050108023-c5249f4df085", 1200),
    alt: "A laptop showing code on a desk",
    placeholder: true,
  },
} satisfies Record<string, Media>;
