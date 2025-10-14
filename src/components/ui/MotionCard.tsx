"use client"

import { motion } from "motion/react"
import * as React from "react"
import { cn } from "@/lib/utils"

function MotionCard({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof motion.div> & {
  ref?: React.Ref<HTMLDivElement>
}) {
  return (
    <motion.div
      ref={ref}
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function MotionCardHeader({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof motion.div> & {
  ref?: React.Ref<HTMLDivElement>
}) {
  return (
    <motion.div
      ref={ref}
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-1.5 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function MotionCardTitle({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof motion.div> & {
  ref?: React.Ref<HTMLDivElement>
}) {
  return (
    <motion.div
      ref={ref}
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function MotionCardDescription({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof motion.div> & {
  ref?: React.Ref<HTMLDivElement>
}) {
  return (
    <motion.div
      ref={ref}
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function MotionCardAction({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof motion.div> & {
  ref?: React.Ref<HTMLDivElement>
}) {
  return (
    <motion.div
      ref={ref}
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function MotionCardContent({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof motion.div> & {
  ref?: React.Ref<HTMLDivElement>
}) {
  return (
    <motion.div
      ref={ref}
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function MotionCardFooter({
  ref,
  className,
  ...props
}: React.ComponentProps<typeof motion.div> & {
  ref?: React.Ref<HTMLDivElement>
}) {
  return (
    <motion.div
      ref={ref}
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  MotionCard,
  MotionCardAction,
  MotionCardContent,
  MotionCardDescription,
  MotionCardFooter,
  MotionCardHeader,
  MotionCardTitle,
}
