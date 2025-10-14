"use client";

import { LucideSkull, LucideUser } from "lucide-react";
import { AnimatePresence, motion, MotionConfig } from "motion/react";
import React, { useEffect, useState } from "react";
import useMeasure from "react-use-measure";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Comment } from "../type";
import CommentForm from "./comment-form";
import CommentItemButtons from "./comment-item-buttons";

export default function CommentItem({
  comment,
  isOwner,
  onDelete,
}: {
  comment: Comment;
  isOwner: boolean;
  onDelete?: () => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const isDeleted = !comment.user;
  const [ref, { height }] = useMeasure();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsMounted(true);
    }, 10);

    return () => clearTimeout(timeout);
  }, []);

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <MotionConfig
      transition={{ type: "spring", duration: 0.4681, bounce: 0.05 }}
    >
      <motion.div
        initial={{
          height: "auto",
          opacity: 0,
        }}
        animate={isMounted ? { height, opacity: 1 } : false}
        exit={{ opacity: 0, height: 0 }}
        key={comment.id}
        className="w-full overflow-hidden will-change-auto"
      >
        <div ref={ref}>
          <AnimatePresence mode="popLayout" initial={false}>
            {isEditing && (
              <motion.div
                layoutId={`comment-${comment.id}`}
                key={`comment-${comment.id}-editing`}
                className="relative z-[2] w-full overflow-hidden will-change-auto"
                style={{
                  borderRadius: "calc(var(--radius) /* 0.25rem */ + 0.125rem",
                }}
              >
                <Card className="w-full">
                  <motion.div
                    layout="position"
                    className="will-change-transform"
                    initial={{
                      opacity: 0,
                      filter: "blur(6px)",
                      transition: {
                        duration: 0.2,
                        bounce: 0,
                      },
                    }}
                    animate={{
                      opacity: 1,
                      filter: "blur(0px)",
                      transition: {
                        duration: 0.2,
                        bounce: 0,
                      },
                    }}
                    exit={{
                      opacity: 0,
                      filter: "blur(6px)",
                      transition: {
                        duration: 0.2,
                        bounce: 0,
                      },
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="text-2xl">Edit comment</CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Edit your comment.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-y-2">
                      <CommentForm
                        ticketId={comment.ticketId}
                        comment={comment}
                        onSuccess={() => setIsEditing(false)}
                      />
                      <Button
                        variant={"outline"}
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </CardContent>
                  </motion.div>
                </Card>
              </motion.div>
            )}

            {!isEditing && (
              <div className="flex w-full gap-x-2">
                <motion.div
                  layoutId={`comment-${comment.id}`}
                  key={`comment-${comment.id}-view`}
                  className="w-full overflow-hidden will-change-auto"
                  style={{
                    borderRadius: "calc(var(--radius) /* 0.25rem */ + 0.125rem",
                  }}
                >
                  <Card className="w-full">
                    <motion.div
                      layout="position"
                      className="will-change-transform"
                      initial={{
                        opacity: 0,
                        filter: "blur(6px)",
                      }}
                      animate={{
                        opacity: 1,
                        filter: "blur(0px)",
                      }}
                      exit={{
                        opacity: 0,
                        filter: "blur(6px)",
                      }}
                    >
                      <CardHeader>
                        <CardTitle className="text-muted-foreground flex items-center gap-x-2 text-sm font-bold">
                          {isDeleted ? (
                            <LucideSkull className="size-5" />
                          ) : (
                            <LucideUser className="size-5" />
                          )}
                          <span>
                            {isDeleted
                              ? "Deleted User"
                              : comment.user?.username}
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="whitespace-pre-line">
                        {comment.content}
                      </CardContent>
                      <CardFooter>
                        <span className="text-muted-foreground text-xs font-bold">
                          {comment.createdAt.toLocaleString()}
                        </span>
                      </CardFooter>
                    </motion.div>
                  </Card>
                </motion.div>

                <CommentItemButtons
                  isMine={isOwner}
                  onEdit={handleEdit}
                  commentId={comment.id}
                  onDelete={onDelete}
                />
              </div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </MotionConfig>
  );
}
