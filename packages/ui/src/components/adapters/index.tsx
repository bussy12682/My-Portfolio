"use client";

/**
 * Framework adapters. Systems in this package never import a framework directly;
 * each app supplies its router link, image component and current path once, at the root.
 */
import {
  createContext,
  useContext,
  type ComponentPropsWithoutRef,
  type ComponentType,
  type ReactNode,
} from "react";

export type AdapterLinkProps = Omit<ComponentPropsWithoutRef<"a">, "href"> & { href: string };
export type AdapterImageProps = {
  src: string;
  alt: string;
  sizes?: string;
  className?: string;
  fill: true;
  preload?: boolean;
};

type Adapters = {
  Link: ComponentType<AdapterLinkProps>;
  Image: ComponentType<AdapterImageProps>;
  pathname: string;
};

function DefaultLink(props: AdapterLinkProps) {
  return <a {...props} />;
}

function DefaultImage({ src, alt, sizes, className }: AdapterImageProps) {
  // Framework-free fallback; apps pass an optimized Image through AdaptersProvider.
  return (
    <img
      src={src}
      alt={alt}
      sizes={sizes}
      className={`absolute inset-0 size-full ${className ?? ""}`}
    />
  );
}

const AdaptersContext = createContext<Adapters>({
  Link: DefaultLink,
  Image: DefaultImage,
  pathname: "/",
});

export function AdaptersProvider({
  children,
  ...adapters
}: Partial<Adapters> & { children: ReactNode }) {
  const parent = useContext(AdaptersContext);
  return (
    <AdaptersContext.Provider value={{ ...parent, ...adapters }}>
      {children}
    </AdaptersContext.Provider>
  );
}

export function useAdapters() {
  return useContext(AdaptersContext);
}

/** Renders the app's router link, or a plain anchor (new tab) for external destinations. */
export function SmartLink({ external, ...props }: AdapterLinkProps & { external?: boolean }) {
  const { Link } = useAdapters();
  if (external) return <a target="_blank" rel="noopener noreferrer" {...props} />;
  return <Link {...props} />;
}

export function SmartImage(props: AdapterImageProps) {
  const { Image } = useAdapters();
  return <Image {...props} />;
}
