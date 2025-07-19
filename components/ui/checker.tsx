import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const checkerVariants = cva(
  "w-4/5 h-4/5 rounded-full transition-all duration-100 relative flex items-center justify-center touch-none overflow-hidden",
  {
    variants: {
      variant: {
        default: "",
        solid: "",
        dashed: "",
        none: "",
      },
      color: {
        red: "text-white",
        black: "text-white",
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
  (
    { className, variant, color, dragging, isKing, children, ...props },
    ref
  ) => {
    // SVG patterns for consistent rendering across devices
    const getSVGPattern = () => {
      const baseColor = color === "red" ? "#ef4444" : "#374151";
      const borderColor = color === "red" ? "#dc2626" : "#1f2937";

      switch (variant) {
        case "solid":
          return (
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
            >
              <circle
                cx="50"
                cy="50"
                r="46"
                fill={baseColor}
                stroke={borderColor}
                strokeWidth="8"
              />
            </svg>
          );

        case "dashed":
          return (
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
            >
              <circle
                cx="50"
                cy="50"
                r="46"
                fill={baseColor}
                stroke={borderColor}
                strokeWidth="6"
                strokeDasharray="12 8"
                strokeDashoffset="0"
              />
            </svg>
          );

        case "none":
          return (
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
            >
              <circle cx="50" cy="50" r="48" fill={baseColor} />
            </svg>
          );

        default:
          return (
            <svg
              className="w-full h-full"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
            >
              <circle
                cx="50"
                cy="50"
                r="46"
                fill={baseColor}
                stroke={borderColor}
                strokeWidth="6"
              />
            </svg>
          );
      }
    };

    return (
      <div
        className={cn(checkerVariants({ variant, color, dragging, className }))}
        ref={ref}
        {...props}
      >
        {getSVGPattern()}
        {isKing && (
          <span
            className="absolute text-yellow-300 text-2xl font-bold z-10"
            aria-hidden="true"
          >
            ♔
          </span>
        )}
        {children && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            {children}
          </div>
        )}
      </div>
    );
  }
);
Checker.displayName = "Checker";

export { Checker, checkerVariants };
