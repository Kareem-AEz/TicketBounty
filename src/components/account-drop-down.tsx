import { useQueryClient } from "@tanstack/react-query";
import { User } from "lucia";
import { LucideLock, LucideLogOut, LucideUser } from "lucide-react";
import Link from "next/link";
import React from "react";
import { signOut } from "@/features/auth/actions/sign-out";
import { accountPasswordPath, accountProfilePath } from "@/paths";
import SubmitButton from "./form/submit-button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

type AccountDropDownProps = {
  user: User;
};

export default function AccountDropDown({ user }: AccountDropDownProps) {
  const queryClient = useQueryClient();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarFallback>
            {user.username?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {/* Profile */}
        <DropdownMenuItem asChild>
          <Link href={accountProfilePath()}>
            <LucideUser />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        {/* Password */}
        <DropdownMenuItem asChild>
          <Link href={accountPasswordPath()}>
            <LucideLock />
            <span>Password</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {/* Sign Out */}
        <DropdownMenuItem asChild>
          <form action={signOut}>
            <SubmitButton
              variant="ghost"
              size="sm"
              className="w-full justify-start p-0"
              onClick={() => {
                queryClient.removeQueries({ queryKey: ["auth", "guard"] });
              }}
            >
              <LucideLogOut />
              <span>Sign Out</span>
            </SubmitButton>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
