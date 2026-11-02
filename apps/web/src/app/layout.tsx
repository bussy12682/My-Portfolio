import type { Metadata } from "next";
import { Geist_Mono, Host_Grotesk } from "next/font/google";
import "@rektinasub/ui/globals.css";
import { SmoothScroll } from "@rektinasub/ui/components/motion";
import { UIAdaptersProvider } from "@/components/providers/ui-adapters-provider";
import { siteConfig } from "@/config/site";

const hostGrotesk = Host_Grotesk({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${hostGrotesk.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <UIAdaptersProvider>
          <SmoothScroll>{children}</SmoothScroll>
        </UIAdaptersProvider>
      </body>
    </html>
  );
}
