"use client";

import { User } from "lucia";
import {
  LucideClipboardClock,
  LucideMoreVertical,
  LucidePencil,
  LucideSquareArrowOutUpRight,
  LucideUser,
} from "lucide-react";
import {
  AnimatePresence,
  motion,
  MotionConfig,
  useReducedMotion,
} from "motion/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import useMeasure from "react-use-measure";
import DeleteButton from "@/components/delete-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isOwner } from "@/features/auth/utils/is-owner";
import type { Prisma } from "@/generated/client";
import { copy } from "@/lib/copy";
import { centToCurrency } from "@/lib/currency";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import { useKeyDown } from "@/lib/hooks/useKeyDown";
import { cn } from "@/lib/utils";
import { ticketPath, ticketsPath } from "@/paths";
import { deleteTicket } from "../actions/delete-ticket";
import { TICKET_STATUS_ICONS } from "../constants";
import DetailButton from "./detail-button";
import TicketDropdownMenu from "./ticket-dropdown-menu";
import TicketUpsertForm from "./ticket-upsert-form";

type TicketItemProps = {
  ticket: Prisma.TicketGetPayload<{
    include: { user: { select: { id: true; username: true } } };
  }>;
  isDetail?: boolean;
  user?: User;
};

function TicketItem({ ticket, isDetail = false, user }: TicketItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const isMobile = useIsMobile();
  const [ref, { height }] = useMeasure();
  const [isMounted, setIsMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  console.log(shouldReduceMotion);

  const isMine = user?.id === ticket.userId;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsMounted(true);
    }, 10);

    return () => clearTimeout(timeout);
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
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : { type: "spring", duration: 0.4, bounce: 0.05 }
      }
    >
      <motion.div
        initial={{
          height: "auto",
          opacity: 0,
          transition: shouldReduceMotion
            ? { duration: 0 }
            : {
                duration: 0,
                opacity: { type: "spring", duration: 0.2, bounce: 0 },
              },
        }}
        animate={isMounted ? { height, opacity: 1 } : false}
        exit={shouldReduceMotion ? undefined : { opacity: 0, height: 0 }}
        key={ticket.id}
        className={cn(
          "w-full max-w-lg self-center will-change-auto",
          isDetail && "max-w-xl",
        )}
      >
        <div ref={ref}>
          <AnimatePresence mode="popLayout" initial={false}>
            {isEditing && (
              <motion.div
                layoutId={`ticket-${ticket.id}-background${isDetail ? "-detail" : "normal"}`}
                className="relative z-2"
                style={{
                  borderRadius: "calc(var(--radius) /* 0.25rem */ + 0.125rem",
                }}
              >
                <Card className="w-full overflow-hidden">
                  <motion.div
                    layoutId={`ticket-${ticket.id}-content${isDetail ? "-detail" : "normal"}`}
                    layout={shouldReduceMotion ? false : "position"}
                    initial={
                      shouldReduceMotion
                        ? false
                        : {
                            opacity: 0,
                            filter: "blur(6px)",
                          }
                    }
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                    }}
                    exit={
                      shouldReduceMotion
                        ? undefined
                        : {
                            opacity: 0,
                            filter: "blur(6px)",
                          }
                    }
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.2,
                      bounce: 0,
                    }}
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
              <div className="group/card z-1 flex w-full justify-center gap-x-1 self-center">
                <>
                  <motion.div
                    layoutId={`ticket-${ticket.id}-background${isDetail ? "-detail" : "normal"}`}
                    className="w-full max-w-xl will-change-auto"
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
                        layoutId={`ticket-${ticket.id}-content${isDetail ? "-detail" : "normal"}`}
                        layout={shouldReduceMotion ? false : "position"}
                        initial={
                          shouldReduceMotion
                            ? undefined
                            : {
                                opacity: 0,
                                filter: "blur(10px)",
                              }
                        }
                        animate={{
                          opacity: 1,
                          filter: "blur(0px)",
                        }}
                        exit={
                          shouldReduceMotion
                            ? undefined
                            : {
                                opacity: 0,
                                filter: "blur(10px)",
                              }
                        }
                        transition={{
                          duration: shouldReduceMotion ? 0 : 0.2,
                          bounce: 0,
                        }}
                        className="flex flex-col gap-y-4 will-change-transform"
                      >
                        <CardHeader>
                          <CardTitle
                            className={cn(
                              "flex min-w-0 items-center gap-x-2",
                              isDetail && "items-start",
                            )}
                          >
                            <span className={cn(isDetail && "mt-1")}>
                              {TICKET_STATUS_ICONS[ticket.status]}
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
                          <div className="flex w-full justify-between">
                            <span className="text-muted-foreground flex items-center gap-x-1 text-xs font-bold">
                              <LucideClipboardClock size={14} />
                              {ticket.deadline}
                              <span className="mx-1">•</span>
                              <LucideUser size={14} />
                              {ticket.user.username}
                            </span>

                            <span className="text-muted-foreground ml-auto text-xs font-bold">
                              {centToCurrency(ticket.bounty)}
                            </span>
                          </div>
                        </CardFooter>
                      </motion.div>
                    </Card>
                  </motion.div>

                  {!isMine && isDetail ? null : (
                    <motion.div
                      className={cn(
                        "group/buttons flex shrink-0 flex-col gap-y-2 overflow-hidden mask-l-from-75% p-1 py-0 pt-2 will-change-transform",
                        isMobile && "mask-l-from-85% mask-l-to-100%",
                      )}
                      layout={shouldReduceMotion ? false : "position"}
                    >
                      {!isDetail && (
                        <>
                          <DetailButton
                            index={0}
                            icon={<LucideSquareArrowOutUpRight />}
                            label={copy.actions.view}
                            href={ticketPath(ticket.id)}
                            prefetchOnHover={true}
                          />
                          {isOwner(user?.id ?? "", ticket.userId) && (
                            <>
                              <DetailButton
                                index={1}
                                icon={<LucidePencil />}
                                label={copy.actions.edit}
                                onClick={() => setIsEditing(true)}
                              />
                              <DeleteButton
                                onDelete={async () => {
                                  const result = await deleteTicket({
                                    id: ticket.id,
                                    isDetail,
                                  });
                                  if (result.status === "SUCCESS") {
                                    return {
                                      success: true,
                                      message: result.message,
                                    };
                                  }
                                  return {
                                    success: false,
                                    message: result.message,
                                  };
                                }}
                                index={2}
                                animate={true}
                              />
                            </>
                          )}
                        </>
                      )}

                      {isDetail && isOwner(user?.id ?? "", ticket.userId) && (
                        <>
                          <DetailButton
                            index={0}
                            icon={<LucidePencil />}
                            label={copy.actions.edit}
                            onClick={() => setIsEditing(true)}
                            animate={false}
                          />

                          <DeleteButton
                            onDelete={async () => {
                              const result = await deleteTicket({
                                id: ticket.id,
                                isDetail,
                              });
                              if (result.status === "SUCCESS") {
                                return {
                                  success: true,
                                  message: result.message,
                                };
                              }
                              return {
                                success: false,
                                message: result.message,
                              };
                            }}
                            animate={false}
                          />

                          <TicketDropdownMenu
                            ticket={ticket}
                            trigger={
                              <Button
                                variant={"outline"}
                                size={"icon"}
                                className="ml-2"
                              >
                                <LucideMoreVertical />
                              </Button>
                            }
                          />
                        </>
                      )}
                    </motion.div>
                  )}
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
