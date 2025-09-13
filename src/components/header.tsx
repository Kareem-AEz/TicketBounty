import { LucideKanban, LucideLogOut } from "lucide-react";
import Link from "next/link";
import React from "react";
import { signOut } from "@/features/auth/actions/sign-out";
import { homePath, signInPath, signUpPath, ticketsPath } from "@/paths";
import SubmitButton from "./form/submit-button";
import ThemeSwitcher from "./theme/theme-switcher";
import { buttonVariants } from "./ui/button";

function Header() {
  const navItems = (
    <>
      <Link
        className={buttonVariants({ variant: "default" })}
        href={ticketsPath()}
      >
        Tickets
      </Link>

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

      <form action={signOut}>
        <SubmitButton icon={<LucideLogOut />}>Sign Out</SubmitButton>
      </form>
    </>
  );

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
        {navItems}
        <ThemeSwitcher />
      </div>
    </nav>
  );
}

export default Header;
