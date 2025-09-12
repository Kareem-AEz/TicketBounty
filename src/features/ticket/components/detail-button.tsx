"use client";

import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TRANSITION_EASING } from "@/lib/constants";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { cn, getStaggeredDelay } from "@/lib/utils";

type DetailButtonProps = {
  index: number;
  icon: React.ReactElement;
  label: string;
  animate?: boolean;
} & (
  | {
      href?: undefined;
      props?: React.ComponentProps<typeof Button>;
      onClick?: () => void;
    }
  | {
      href: string;
      props?: Omit<React.ComponentProps<typeof Link>, "href">;
      onClick?: never;
    }
);

function DetailButton({
  index,
  icon,
  href,
  label,
  onClick,
  props,
  animate = true,
}: DetailButtonProps) {
  const isMobile = useIsMobile();

  // Common button props
  const commonProps = {
    variant: "outline" as const,
    size: "icon" as const,
    "aria-label": label,
    onPointerOut: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.currentTarget.blur();
    },
  };

  // Mobile button (simple, no complex animations)
  const mobileClassName = "active:scale-95";

  const animateClassName = cn(
    "-translate-x-full scale-90 opacity-0",
    "group-focus-within/buttons:translate-x-0 group-focus-within/buttons:scale-100 group-focus-within/buttons:opacity-100",
    "group-hover/card:translate-x-0 group-hover/card:scale-100 group-hover/card:opacity-60",
    "hover:opacity-100 active:scale-95",
  );

  // Desktop button (complex hover/focus states)
  const desktopClassName = cn(
    "ml-2",

    animate && animateClassName,
  );

  const desktopStyle = animate
    ? {
        transitionDuration: TRANSITION_EASING.SPRING_BASE.duration,
        transitionTimingFunction: TRANSITION_EASING.SPRING_BASE.easing,
        ...getStaggeredDelay({ index }),
      }
    : {};

  // Button content (either clickable or link)
  const ButtonContent = (tProps: React.ComponentProps<typeof Button>) => {
    const buttonProps = {
      ...commonProps,
      className: isMobile ? mobileClassName : desktopClassName,
      style: isMobile ? undefined : desktopStyle,
      ...tProps,
    };

    if (href) {
      return (
        <Button {...buttonProps} asChild>
          <Link href={href} {...props}>
            {icon}
          </Link>
        </Button>
      );
    }

    return (
      <Button {...buttonProps} onClick={onClick}>
        {icon}
      </Button>
    );
  };

  // Desktop: wrapped in tooltip
  return (
    <Tooltip disableHoverableContent delayDuration={1000}>
      <TooltipTrigger asChild>
        <ButtonContent />
      </TooltipTrigger>

      <TooltipContent side="right" className="pointer-events-none select-none">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

export default DetailButton;
