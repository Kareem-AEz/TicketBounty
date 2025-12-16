import { cva, type VariantProps } from "class-variance-authority";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
} from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";

const noteVariants = cva(
  "relative w-full rounded-lg border px-4 py-3 text-sm flex items-start gap-3",
  {
    variants: {
      type: {
        default: "border-border bg-background text-foreground",
        secondary: "border-border bg-secondary/50 text-secondary-foreground",
        tertiary: "border-border bg-muted/50 text-muted-foreground",
        warning:
          "border-amber-500/50 text-amber-900 dark:text-amber-100 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400",
        success:
          "border-emerald-500/50 text-emerald-900 dark:text-emerald-100 [&>svg]:text-emerald-600 dark:[&>svg]:text-emerald-400",
        error:
          "border-red-500/50 text-red-900 dark:text-red-100 [&>svg]:text-red-600 dark:[&>svg]:text-red-400",
        alert:
          "border-red-500/50 text-red-900 dark:text-red-100 [&>svg]:text-red-600 dark:[&>svg]:text-red-400",
        lite: "border-border bg-background text-foreground",
        ghost: "border-transparent bg-transparent text-foreground",
        violet:
          "border-violet-500/50 text-violet-900 dark:text-violet-100 [&>svg]:text-violet-600 dark:[&>svg]:text-violet-400",
        cyan: "border-cyan-500/50 text-cyan-900 dark:text-cyan-100 [&>svg]:text-cyan-600 dark:[&>svg]:text-cyan-400",
        "rotate-ccw": "border-border bg-background text-foreground", // fallback for specific icon types if needed
      },
      fill: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        type: "default",
        fill: true,
        class: "bg-foreground text-background border-foreground",
      },
      {
        type: "secondary",
        fill: true,
        class: "bg-secondary text-secondary-foreground border-secondary",
      },
      {
        type: "tertiary",
        fill: true,
        class: "bg-muted text-muted-foreground border-muted",
      },
      {
        type: "warning",
        fill: true,
        class: "bg-amber-500/15 border-amber-500/50 dark:bg-amber-500/10",
      },
      {
        type: "success",
        fill: true,
        class: "bg-emerald-500/15 border-emerald-500/50 dark:bg-emerald-500/10",
      },
      {
        type: "error",
        fill: true,
        class: "bg-red-500/15 border-red-500/50 dark:bg-red-500/10",
      },
      {
        type: "alert",
        fill: true,
        class: "bg-red-500/15 border-red-500/50 dark:bg-red-500/10",
      },
      {
        type: "violet",
        fill: true,
        class: "bg-violet-500/15 border-violet-500/50 dark:bg-violet-500/10",
      },
      {
        type: "cyan",
        fill: true,
        class: "bg-cyan-500/15 border-cyan-500/50 dark:bg-cyan-500/10",
      },
    ],
    defaultVariants: {
      type: "default",
      fill: false,
    },
  },
);

const icons = {
  default: Info,
  secondary: Info,
  tertiary: Info,
  warning: AlertTriangle,
  success: CheckCircle2,
  error: XCircle,
  alert: AlertCircle,
  lite: Info,
  ghost: Info,
  violet: Info,
  cyan: Info,
  "rotate-ccw": Info,
};

export interface NoteProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof noteVariants> {
  action?: React.ReactNode;
  label?: string | boolean;
}

function Note({
  className,
  type = "default",
  fill = false,
  action,
  label,
  children,
  ...props
}: NoteProps) {
  const Icon = icons[type as keyof typeof icons] || Info;

  const getLabel = () => {
    if (label === false) return null;
    if (typeof label === "string") return label;
    // If label is true or undefined, return capitalized type
    if (label === true || label === undefined) {
      return type ? type.charAt(0).toUpperCase() + type.slice(1) : "Note";
    }
    return null;
  };

  const labelText = getLabel();

  return (
    <div
      className={cn(
        noteVariants({ type, fill }),
        "flex-col sm:flex-row sm:items-center",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "flex flex-1 shrink-0 gap-2 sm:flex-row sm:items-start sm:gap-3",
          labelText && "flex-col",
        )}
      >
        <div className="flex items-start gap-2">
          <Icon className="mt-0.5 size-3.5 shrink-0 sm:size-4" />
          {labelText && (
            <span className="shrink-0 pt-px text-xs font-semibold tracking-wider uppercase opacity-90 select-none sm:text-sm">
              {labelText}
            </span>
          )}
        </div>

        <div className="flex-1 text-sm opacity-90 [&_p]:leading-relaxed">
          {children}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export { Note, noteVariants };
