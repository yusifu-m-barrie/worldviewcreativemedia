import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-[#2E2A86] text-white",
        orange: "bg-[#E8872A] text-white",
        live: "bg-red-600 text-white animate-pulse",
        outline: "border border-[#2E2A86] text-[#2E2A86]",
        secondary: "bg-muted text-foreground-muted",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
