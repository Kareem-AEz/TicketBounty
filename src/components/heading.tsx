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
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          {description && (
            <p className="text-muted-foreground mt-2 text-sm">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-x-2">{action}</div>
      </div>

      <Separator className="" />
    </>
  );
}

export default Heading;
