"use client";

import { LucideKanban } from "lucide-react";
import Link from "next/link";
import React from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { homePath, signInPath, signUpPath } from "@/paths";
import AccountDropDown from "./account-drop-down";
import ThemeSwitcher from "./theme/theme-switcher";
import { buttonVariants } from "./ui/button";

function Header() {
  const { user, isFetched } = useAuth();

  if (!isFetched) return null;

  const navItems = user ? (
    <>
      <AccountDropDown user={user} />
    </>
  ) : (
    <>
      <Link
        className={buttonVariants({ variant: "outline" })}
        href={signUpPath()}
      >
        Sign Up
      </Link>

      <Link
        className={buttonVariants({ variant: "outline" })}
        href={signInPath()}
      >
        Sign In
      </Link>
    </>
  );

  return (
    <nav className="supports-[backdrop-filter]:bg-background/60 bg-background/95 animate-fade-from-top fixed z-50 flex w-full items-center justify-between border-b px-5 py-2.5 supports-[backdrop-filter]:backdrop-blur">
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
        {navItems}
      </div>
    </nav>
  );
}

export default Header;
