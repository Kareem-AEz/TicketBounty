"use client";

import { LucideMoon, LucideSun } from "lucide-react";
import { useTheme } from "next-themes";
import React from "react";
import { Button } from "../ui/button";

function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant={"ghost"}
      size={"icon"}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <LucideSun className="scale-50 rotate-0 opacity-0 transition-all! dark:scale-100 dark:rotate-90 dark:opacity-100" />

      <LucideMoon className="absolute scale-100 rotate-0 opacity-100 transition-all! dark:scale-50 dark:rotate-90 dark:opacity-0" />

      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

export default ThemeSwitcher;
