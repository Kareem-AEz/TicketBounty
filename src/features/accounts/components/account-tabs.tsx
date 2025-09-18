"use client";

import { motion, MotionConfig } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { accountPasswordPath, accountProfilePath } from "@/paths";

export default function AccountTabs() {
  const pathName = usePathname();
  const currentTab = pathName.includes("/password") ? "password" : "profile";

  return (
    <Tabs
      defaultValue={currentTab}
      className="items-center justify-center self-center"
    >
      <TabsList>
        <MotionConfig transition={{ type: "spring", duration: 0.3, bounce: 0 }}>
          <div className="relative">
            <TabsTrigger value="profile" data-state={"inactive"} asChild>
              <Link href={accountProfilePath()}>Profile</Link>
            </TabsTrigger>
            {currentTab === "profile" && (
              <motion.div
                layoutId="account-tab-indicator"
                className="bg-primary absolute bottom-0.5 left-0 h-0.5 w-1/2 translate-x-1/2 rounded-full will-change-transform"
                style={{
                  originY: "0px",
                }}
              />
            )}
          </div>

          <div className="relative">
            <TabsTrigger
              data-state={"inactive"}
              value="password"
              className="relative"
              asChild
            >
              <Link href={accountPasswordPath()}>Password</Link>
            </TabsTrigger>

            {currentTab === "password" && (
              <motion.div
                layoutId="account-tab-indicator"
                className="bg-primary absolute bottom-0.5 left-0 h-0.5 w-1/2 translate-x-1/2 rounded-full will-change-transform"
                style={{
                  originY: "0px",
                }}
              />
            )}
          </div>
        </MotionConfig>
      </TabsList>
    </Tabs>
  );
}
