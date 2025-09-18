"use client";

import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { cn } from "@/lib/utils";
import { SIDEBAR_ITEMS } from "../constants";
import SideBarItem from "./sidebar-item";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isFetched } = useAuth();
  // const [isTransitioning, setIsTransitioning] = useState(false);

  const isMobile = useIsMobile();

  const handleToggle = (o: boolean) => {
    // setIsTransitioning(true);
    setIsOpen(o);
    // setTimeout(() => setIsTransitioning(false), 400);
  };

  if (!user || !isFetched) return null;

  return (
    <>
      <div
        id="sidebar-overlay"
        className="pointer-events-none absolute top-0 left-0 z-30 h-full w-full bg-black/50 opacity-0 backdrop-blur-xs duration-200 ease-[cubic-bezier(0.424,0.154,0.526,0.836)]"
      />
      <nav
        id="sidebar"
        data-open={isOpen}
        className={cn(
          "bg-sidebar fixed z-40 flex h-screen w-64 flex-col gap-y-4 overflow-hidden border-r p-4 pt-24 will-change-auto",
          "animate-fade-from-left duration-400 ease-[linear(0,0.003_0.5%,0.012_1%,0.028_1.6%,0.048_2.2%,0.076_2.9%,0.11_3.7%,0.304_7.9%,0.396_10.1%,0.449_11.5%,0.498_12.9%,0.546_14.4%,0.589_15.9%,0.631_17.5%,0.67_19.2%,0.708_21%,0.741_22.8%,0.772_24.7%,0.801_26.7%,0.827_28.8%,0.851_31%,0.872_33.3%,0.892_35.8%,0.909_38.4%,0.924_41.1%,0.937_44%,0.949_47.1%,0.959_50.4%,0.968_54%,0.981_61.9%,0.99_71.5%,0.996_83.5%,1)]",
          isOpen
            ? "max-md:-translate-x-[calc(100%-6rem)]"
            : "-translate-x-[calc(100%-6rem)]",
        )}
        onMouseEnter={() => handleToggle(true)}
        onMouseLeave={() => handleToggle(false)}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={isOpen && !isMobile ? "open" : "closed"}
            className={cn(
              "flex flex-col gap-2 space-y-2 px-2 py-2",
              isOpen && !isMobile ? "md:w-full md:self-start" : "self-end",
            )}
            transition={{
              type: "spring",
              duration: 0.4,
              bounce: 0.05,
            }}
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
          >
            {SIDEBAR_ITEMS.map((item) => (
              <SideBarItem
                key={item.href}
                isOpen={isOpen}
                item={item}
                isMobile={isMobile}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </nav>
    </>
  );
}
