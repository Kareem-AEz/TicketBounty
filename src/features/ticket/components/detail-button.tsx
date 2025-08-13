import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getStaggeredStyle } from "@/lib/utils";

type DetailButtonProps = {
  index: number;
  icon: React.ReactElement;
  href: string;
  label: string;
};

function DetailButton({ index, icon, href, label }: DetailButtonProps) {
  return (
    <Tooltip disableHoverableContent>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          asChild
          className="ml-2 -translate-x-full scale-90 opacity-0 group-focus-within/buttons:translate-x-0 group-focus-within/buttons:scale-100 group-focus-within/buttons:opacity-100 group-hover/card:translate-x-0 group-hover/card:scale-100 group-hover/card:opacity-100"
          style={getStaggeredStyle(index)}
          aria-label={label}
        >
          <Link className="truncate text-sm" href={href}>
            {icon}
          </Link>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right" className="pointer-events-none select-none">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export default DetailButton;
