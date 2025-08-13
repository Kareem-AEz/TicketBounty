import Link from "next/link";
import React from "react";
import Heading from "@/components/heading";
import { ticketsPath } from "@/paths";

function HomePage() {
  return (
    <div className="flex flex-col gap-y-8">
      <Heading
        title="HomePage"
        description="Your one stop shop for all your ticket needs"
      />

      <div className="flex flex-col items-center">
        <Link className="underline" href={ticketsPath()}>
          Tickets
        </Link>
      </div>
    </div>
  );
}

export default HomePage;
