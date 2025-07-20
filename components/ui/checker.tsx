import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const checkerVariants = cva(
  "w-4/5 h-4/5 rounded-full transition-all duration-100 relative flex items-center justify-center touch-none overflow-hidden",
  {
    variants: {
      variant: {
        solid: "",
        dashed: "",
        dots: "",
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
      variant: "solid",
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
    /**
     * Generates the SVG visual representation of the checker piece.
     * Creates different border styles (solid, dashed, dots, or none)
     * for the circular checker piece based on the selected variant.
     */
    const getCheckerPattern = () => {
      const baseColor = color === "red" ? "#ef4444" : "#374151";
      const borderColor = color === "red" ? "#dc2626" : "#1f2937";

      return (
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Base filled circle */}
          <circle cx="50" cy="50" r="48" fill={baseColor} />

          {/* Inner border circle - positioned completely inside */}
          {variant !== "none" && (
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={
                variant === "dashed" || variant === "dots"
                  ? "white"
                  : borderColor
              }
              strokeWidth={variant === "solid" ? "8" : "6"}
              strokeDasharray={
                variant === "dashed"
                  ? "12 8"
                  : variant === "dots"
                  ? "3 10"
                  : undefined
              }
              strokeLinecap={variant === "dots" ? "round" : undefined}
            />
          )}
        </svg>
      );
    };

    return (
      <div
        className={cn(checkerVariants({ variant, color, dragging, className }))}
        ref={ref}
        {...props}
      >
        {getCheckerPattern()}
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
