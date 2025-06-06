
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
          "ml-2 rounded-full bg-blue-900/50 px-2 py-0.5 font-['Inconsolata'] tracking-wide text-xs font-bold text-blue-500",
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
