import React from "react";
import { Separator } from "./ui/separator";

interface HeadingProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

function Heading({ title, description, action }: HeadingProps) {
  return (
    <>
      <div className="flex items-center justify-between px-8">
        <div className="">
          <h2 className="bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-3xl font-bold tracking-tight text-transparent">
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground mt-2 text-sm tracking-wide">
              {description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-x-2">{action}</div>
      </div>

      <Separator className="via-border/60 bg-gradient-to-r from-transparent to-transparent" />
    </>
  );
}

export default Heading;
