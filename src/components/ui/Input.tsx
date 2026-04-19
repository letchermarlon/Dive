import * as React from "react";
import { cn } from "@/lib/utils";

const baseClass =
  "w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>}
      <input ref={ref} className={cn(baseClass, className)} {...props} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>}
      <textarea ref={ref} className={cn(baseClass, "resize-none", className)} {...props} />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";

export { Input, Textarea };
export default Input;
