import { Reveal } from "@rektinasub/ui/components/motion";
import { Eyebrow, typeScale } from "@rektinasub/ui/components/typography";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "cn";
import type { ComponentProps, ReactNode } from "react";

/** The one horizontal rhythm: 1450px content width. The header and announcement bar align to it. */
export function Container({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[1450px] px-5 sm:px-8 lg:px-10", className)}
      {...props}
    />
  );
}

/**
 * Section surfaces: `default` is the page canvas (#0F0F0F on the dark site), `subtle` a deeper
 * band (near-black) for contrast.
 */
const sectionVariants = cva("relative w-full text-foreground", {
  variants: {
    surface: {
      default: "bg-background",
      subtle: "bg-subtle",
    },
    spacing: {
      default: "py-20 sm:py-24 lg:py-30",
      compact: "py-12 sm:py-16",
      none: "",
    },
  },
  defaultVariants: { surface: "default", spacing: "default" },
});

export type SectionProps = ComponentProps<"section"> & VariantProps<typeof sectionVariants>;

/** The one vertical rhythm for page sections. Children are wrapped in a Container. */
export function Section({ surface, spacing, className, children, ...props }: SectionProps) {
  return (
    <section className={cn(sectionVariants({ surface, spacing }), className)} {...props}>
      <Container>{children}</Container>
    </section>
  );
}

export type SectionHeaderProps = {
  eyebrow?: string;
  /** Use `\n` to force a line break, as the reference does for two-line headlines. */
  title: ReactNode;
  description?: ReactNode;
  align?: "start" | "center";
  className?: string;
};

/**
 * Eyebrow, 58px title and 18px lead. Spacing matches the reference: 37px from the eyebrow cap to the
 * title cap, 29px from the title baseline to the lead.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeaderProps) {
  return (
    <Reveal
      className={cn(
        "flex max-w-4xl flex-col",
        align === "center" && "mx-auto items-center text-center",
        className,
      )}
    >
      {eyebrow && <Eyebrow className="mb-[0.8125rem]">{eyebrow}</Eyebrow>}
      <h2 className={cn(typeScale.title, "whitespace-pre-line")}>{title}</h2>
      {description && (
        <p className={cn(typeScale.lead, "mt-3 max-w-[52ch] text-foreground")}>{description}</p>
      )}
    </Reveal>
  );
}
