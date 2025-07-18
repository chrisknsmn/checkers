import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const checkerVariants = cva(
  "w-4/5 h-4/5 rounded-full transition-all duration-100 relative flex items-center justify-center touch-none",
  {
    variants: {
      variant: {
        default: "border-4 border-black/30",
        solid: "border-4 border-black",
        dashed: "border-4 border-dashed border-black/60",
        groove: "border-4 border-groove border-black/40",
        ridge: "border-4 border-ridge border-black/40",
        inset: "border-4 border-inset border-black/50",
        outset: "border-4 border-outset border-black/50",
        none: "border-0",
      },
      color: {
        red: "bg-red-500 text-white",
        black: "bg-gray-800 text-white",
      },
      dragging: {
        true: "opacity-50 cursor-grabbing",
        false: "cursor-grab",
      },
    },
    defaultVariants: {
      variant: "default",
      color: "red",
      dragging: false,
    },
  }
);

export interface CheckerProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "color">,
    VariantProps<typeof checkerVariants> {
  isKing?: boolean;
}

const Checker = React.forwardRef<HTMLDivElement, CheckerProps>(
  ({ className, variant, color, dragging, isKing, children, ...props }, ref) => {
    return (
      <div
        className={cn(checkerVariants({ variant, color, dragging, className }))}
        ref={ref}
        {...props}
      >
        {isKing && (
          <span className="text-yellow-300" aria-hidden="true">
            ♔
          </span>
        )}
        {children}
      </div>
    );
  }
);
Checker.displayName = "Checker";

export { Checker, checkerVariants };