
import * as React from "react";
import { cn } from "@/lib/utils";

interface CountBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  count: number;
  align?: "left" | "right";
}

const CountBadge = React.forwardRef<HTMLSpanElement, CountBadgeProps>(
  ({ count, className, align = "right", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "rounded-full bg-[#0765E9]/10 px-2 py-0.5 text-xs font-normal text-[#0765E9]",
          align === "right" ? "ml-auto" : "ml-2",
          className
        )}
        {...props}
      >
        {count}
      </span>
    );
  }
);

CountBadge.displayName = "CountBadge";

export { CountBadge };
