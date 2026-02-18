import { LucideHeart } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";

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
          <LucideHeart className="size-5 stroke-3 text-red-500 dark:stroke-2" />

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
