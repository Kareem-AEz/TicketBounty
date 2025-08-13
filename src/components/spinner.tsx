import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Spinner({ size = "lg", className }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-8 w-8 border-[3px]",
  };

  return (
    <div className="flex flex-1 items-center justify-center">
      <div
        className={cn(
          "animate-spin rounded-full border-solid border-gray-300 border-t-gray-900 [animation-duration:0.761s] dark:border-gray-600 dark:border-t-gray-100",
          sizeClasses[size],
          className,
        )}
        role="status"
        aria-label="Loading"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}
