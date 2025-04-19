import * as React from "react";
import { cn } from "@/lib/utils";

interface CountBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  count: number;
}

const CountBadge = React.forwardRef<HTMLSpanElement, CountBadgeProps>(
  ({ count, className, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "rounded-full bg-blue-950/80 px-2 py-0.5 font-['Inconsolata'] tracking-wide text-xs font-bold text-blue-400",
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
