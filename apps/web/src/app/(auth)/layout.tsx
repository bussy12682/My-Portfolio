import { Stage } from "@rektinasub/ui/components/showcase";
import type { ReactNode } from "react";
import { Wordmark } from "@/components/brand/wordmark";
import { ReceiptScreen, StageScreen } from "@/components/site/previews";
import { screens } from "@/config/home";

// Focused auth chrome: brand top-left, the form on the left half, a product screen on the right.
export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col px-5 py-6 sm:px-8 lg:px-10">
        <Wordmark />
        <main className="flex flex-1 items-center justify-center py-16">{children}</main>
      </div>
      <Stage className="hidden lg:block">
        <StageScreen width="26rem" className="top-[18%]">
          <ReceiptScreen order={screens.receipt} />
        </StageScreen>
      </Stage>
    </div>
  );
}
