import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-11 w-full min-w-0 rounded-[var(--radius-control)] bg-input px-4 text-[0.9375rem] outline-none transition-[box-shadow,border-color] placeholder:text-muted-foreground focus-visible:ring-4 focus-visible:ring-ring/20",
        className
      )}
      {...props}
    />
  );
}
export { Input };
