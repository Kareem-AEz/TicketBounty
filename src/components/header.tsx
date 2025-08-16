import { LucideKanban } from "lucide-react";
import Link from "next/link";
import React from "react";
import { homePath, ticketsPath } from "@/paths";
import ThemeSwitcher from "./theme/theme-switcher";
import { buttonVariants } from "./ui/button";

function Header() {
  return (
    <nav className="supports-[backdrop-filter]:bg-background/60 bg-background/95 fixed z-10 flex w-full items-center justify-between border-b px-5 py-2.5 supports-[backdrop-filter]:backdrop-blur">
      <div>
        <Link
          className={buttonVariants({ variant: "ghost" })}
          href={homePath()}
        >
          <LucideKanban className="size-6" />
          <h1 className="text-lg font-semibold">TicketBounty</h1>
        </Link>
      </div>
      <div className="flex items-center gap-2">
        <ThemeSwitcher />
        <Link
          className={buttonVariants({ variant: "default" })}
          href={ticketsPath()}
        >
          Tickets
        </Link>
      </div>
    </nav>
  );
}

export default Header;
