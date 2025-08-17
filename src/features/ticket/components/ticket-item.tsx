"use client";

import { Ticket } from "@prisma/client";
import { LucidePencil, LucideSquareArrowOutUpRight } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import { redirect, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import useMeasure from "react-use-measure";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { copy } from "@/lib/copy";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useKeyDown } from "@/lib/hooks/useKeyDown";
import { cn } from "@/lib/utils";
import { ticketPath, ticketsPath } from "@/paths";
import { TICKET_ICONS } from "../constants";
import { parseDate } from "../utils/ticket-utils";
import DetailButton from "./detail-button";
import TicketDeleteButton from "./ticket-delete-button";
import TicketUpsertForm from "./ticket-upsert-form";

type TicketItemProps = {
  ticket: Ticket;
  isDetail?: boolean;
};

function TicketItem({ ticket, isDetail = false }: TicketItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();
  const isMobile = useIsMobile();
  const [ref, { height }] = useMeasure();
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useKeyDown("Backspace", () => redirect(ticketsPath()), {
    enabled: isDetail,
    disableOnInput: true,
  });

  useKeyDown("Escape", () => setIsEditing(false), {
    enabled: isEditing,
    disableOnInput: false,
  });

  return (
    <MotionConfig
      transition={{ type: "spring", mass: 1, damping: 22, stiffness: 250 }}
    >
      <motion.div
        animate={isMounted ? { height } : false}
        initial={{ height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        key={ticket.id}
        className={cn("w-full max-w-md self-center", isDetail && "max-w-xl")}
      >
        <div ref={ref}>
          <AnimatePresence mode="popLayout" initial={false}>
            {isEditing && (
              <motion.div
                layoutId={`ticket-${ticket.id}-background${isDetail ? "-detail" : ""}`}
                className="relative z-[2]"
                style={{
                  borderRadius: "calc(var(--radius) /* 0.25rem */ + 0.125rem",
                }}
              >
                <Card className="w-full overflow-hidden">
                  <motion.div
                    layoutId={`ticket-${ticket.id}-content${isDetail ? "-detail" : ""}`}
                    layout="position"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col gap-y-4 will-change-transform"
                  >
                    <CardHeader>
                      <CardTitle>Edit Ticket</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <TicketUpsertForm
                        ticket={ticket}
                        onClose={() => setIsEditing(false)}
                      />
                    </CardContent>
                  </motion.div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="popLayout" initial={false}>
            {!isEditing && (
              <div
                className="group/card z-[1] flex w-full justify-center gap-x-1 self-center"
                onMouseEnter={() => router.prefetch(ticketPath(ticket.id))}
              >
                <>
                  <motion.div
                    layoutId={`ticket-${ticket.id}-background${isDetail ? "-detail" : ""}`}
                    className="w-full max-w-xl"
                  >
                    <Card
                      className={cn(
                        "h-full w-full max-w-md",
                        isDetail && "max-w-xl",
                        !isDetail && "pointer-events-none",
                      )}
                      style={{
                        borderRadius:
                          "calc(var(--radius) /* 0.25rem */ + 0.125rem",
                      }}
                    >
                      <motion.div
                        layoutId={`ticket-${ticket.id}-content${isDetail ? "-detail" : ""}`}
                        layout="position"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col gap-y-4"
                      >
                        <CardHeader>
                          <CardTitle
                            className={cn(
                              "flex min-w-0 items-center gap-x-2",
                              isDetail && "items-start",
                            )}
                          >
                            <span className={cn(isDetail && "mt-1")}>
                              {TICKET_ICONS[ticket.status]}
                            </span>
                            <h3
                              className={cn(
                                "text-xl font-semibold",
                                !isDetail && "truncate",
                              )}
                            >
                              {ticket.title}
                            </h3>
                          </CardTitle>
                        </CardHeader>

                        <CardContent>
                          <span
                            className={cn(
                              "text-muted-foreground line-clamp-2 text-sm whitespace-pre-wrap",
                              ticket.status === "DONE" && "line-through",
                              isDetail && "line-clamp-none",
                            )}
                          >
                            {ticket.content}
                          </span>
                        </CardContent>

                        <CardFooter>
                          <div className="flex items-center gap-x-2">
                            <span className="text-muted-foreground text-xs font-bold">
                              {parseDate(ticket)}
                            </span>
                          </div>
                        </CardFooter>
                      </motion.div>
                    </Card>
                  </motion.div>

                  <motion.div
                    className={cn(
                      "group/buttons flex shrink-0 flex-col gap-y-2 overflow-hidden mask-l-from-75% p-1",
                      isMobile && "mask-l-from-85% mask-l-to-100%",
                    )}
                    layout="position"
                  >
                    {!isDetail && (
                      <>
                        <DetailButton
                          index={0}
                          icon={<LucideSquareArrowOutUpRight />}
                          label={copy.actions.view}
                          href={ticketPath(ticket.id)}
                        />
                        <DetailButton
                          index={1}
                          icon={<LucidePencil />}
                          label={copy.actions.edit}
                          onClick={() => setIsEditing(true)}
                        />

                        <TicketDeleteButton ticket={ticket} />
                      </>
                    )}

                    {isDetail && (
                      <>
                        <DetailButton
                          index={0}
                          icon={<LucidePencil />}
                          label={copy.actions.edit}
                          onClick={() => setIsEditing(true)}
                        />

                        <TicketDeleteButton ticket={ticket} isDetail />
                      </>
                    )}
                  </motion.div>
                </>
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </MotionConfig>
  );
}

export default TicketItem;
