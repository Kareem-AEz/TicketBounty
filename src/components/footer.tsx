import Link from "next/link";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export default async function Footer({
  ...props
}: React.ComponentProps<"footer">) {
  return (
    <footer
      className="font-pixellari bg-secondary/20 flex flex-col items-center justify-center pl-[7rem] tracking-wider"
      {...props}
    >
      <Separator className="mask-r-from-95% mask-r-to-100% mask-l-from-95% mask-l-to-100%" />

      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-muted-foreground flex items-center gap-x-1 text-sm">
          <span>Built with </span>

          <Tooltip>
            <TooltipTrigger asChild aria-label="Built with love">
              <span className="relative inline-block size-5 -translate-y-0.5 align-middle">
                {/* This spans underneath the heart and expands/fades in a loop */}
                <span className="absolute inset-0 -translate-y-px animate-ping rounded-full bg-rose-400/40" />
                {/* The heart sits above, glowing */}
                <HeartIcon className="glow-heart relative size-5 text-red-500 drop-shadow" />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                <span className="font-bold text-rose-500">Built with love</span>
                <span className="ml-1 font-mono text-xs text-amber-600 dark:text-amber-400">
                  and pixel magic
                </span>
              </p>
            </TooltipContent>
          </Tooltip>

          <span>
            by
            <span className="text-primary font-extrabold dark:font-bold">
              {" "}
              Kareem Ahmed
            </span>
          </span>
        </p>

        <p className="text-muted-foreground mt-2 text-xs">
          © {new Date().getFullYear()} Ticket Bounty. All rights reserved.
        </p>

        <div className="flex items-center">
          <Link
            target="_blank"
            rel="noopener noreferrer"
            href="https://x.com/KareemAhmedEz"
            aria-label="Kareem Ahmed's X profile"
            className="focus-visible:ring-ring/50 focus-visible:ring-offset-secondary/20 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <TwitterIcon
              className="fill-muted-foreground hover:fill-primary box-content size-4 p-2 opacity-80 transition-all hover:opacity-100"
              aria-label="X"
            />
          </Link>

          <Link
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/Kareem-AEz/TicketBounty"
            aria-label="Kareem Ahmed's GitHub profile"
            className="focus-visible:ring-ring/50 focus-visible:ring-offset-secondary/20 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          >
            <GithubIcon
              className="fill-muted-foreground hover:fill-primary box-content size-4 p-2 opacity-80 transition-all hover:opacity-100"
              aria-label="GitHub"
            />
          </Link>
        </div>
      </div>
    </footer>
  );
}

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-5", className)}
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>GitHub</title>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("size-5", className)}
      role="img"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>X</title>
      <path d="M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z" />
    </svg>
  );
}

function HeartIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      className={cn("size-5", className)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      style={style}
    >
      <path
        d="M12 4.32781C12.1935 4.18729 12.4386 4.02609 12.7319 3.86553C13.5214 3.43347 14.6725 3 16.1111 3C17.5979 3 19.0829 3.5977 20.1921 4.78484C21.3047 5.97563 22 7.71515 22 9.9375C22 13.2536 19.6489 16.0247 17.3927 17.8948C16.2446 18.8464 15.0735 19.6049 14.1357 20.1276C13.6669 20.3889 13.2492 20.5954 12.9151 20.7391C12.7487 20.8106 12.5947 20.8702 12.4603 20.9134C12.3511 20.9485 12.1754 21 12 21C11.8246 21 11.6489 20.9485 11.5397 20.9134C11.4053 20.8702 11.2513 20.8106 11.0849 20.7391C10.7508 20.5954 10.3331 20.3889 9.86432 20.1276C8.92652 19.6049 7.75539 18.8464 6.60732 17.8948C4.35114 16.0247 2 13.2536 2 9.9375C2 7.71515 2.69528 5.97563 3.80789 4.78484C4.91708 3.5977 6.40208 3 7.88889 3C9.32752 3 10.4786 3.43347 11.2681 3.86553C11.5614 4.02609 11.8065 4.18729 12 4.32781Z"
        fill="currentColor"
      />
    </svg>
  );
}
