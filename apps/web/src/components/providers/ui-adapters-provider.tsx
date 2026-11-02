"use client";

import { AdaptersProvider } from "@rektinasub/ui/components/adapters";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Gives the shared UI systems Next.js routing, image optimisation and the current path. */
export function UIAdaptersProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <AdaptersProvider Link={Link} Image={Image} pathname={pathname}>
      {children}
    </AdaptersProvider>
  );
}
