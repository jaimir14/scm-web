import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-lg border border-border/70 bg-card px-3.5 py-2 text-base shadow-[var(--shadow-input)] ring-offset-background transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground/60 hover:border-[hsl(var(--primary)/0.5)] focus-visible:outline-none focus-visible:border-[hsl(var(--primary))] focus-visible:shadow-[var(--shadow-input-focus)] disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50 aria-[invalid=true]:border-destructive aria-[invalid=true]:shadow-[0_0_0_4px_hsl(var(--destructive)/0.1)] data-[success=true]:border-[hsl(var(--success))] data-[success=true]:shadow-[0_0_0_4px_hsl(var(--success)/0.12)] md:text-sm",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
