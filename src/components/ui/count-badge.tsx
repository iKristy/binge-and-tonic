
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
          "ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-normal text-primary",
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
