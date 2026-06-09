import * as React from "react";

import { cn } from "@/lib/utils";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-input bg-card px-3.5 py-2.5 text-sm shadow-[var(--shadow-input)] ring-offset-background transition-all placeholder:text-muted-foreground/70 hover:border-[hsl(var(--primary)/0.4)] focus-visible:outline-none focus-visible:border-[hsl(var(--primary))] focus-visible:shadow-[var(--shadow-input-focus)] disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/50 aria-[invalid=true]:border-destructive aria-[invalid=true]:shadow-[0_0_0_4px_hsl(var(--destructive)/0.1)]",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
