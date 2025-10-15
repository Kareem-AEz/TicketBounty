"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "lucia";
import { XCircleIcon } from "lucide-react";
import { AnimatePresence, motion, MotionConfig, useInView } from "motion/react";
import React, { useEffect, useRef } from "react";
import { PaginationMetadata } from "@/components/pagination";
import Spinner from "@/components/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getComments } from "../queries/get-comments";
import CommentForm from "./comment-form";
import CommentItem from "./comment-item";

type Comment = Awaited<ReturnType<typeof getComments>>["data"][number];

type CommentsProps = {
  ticketId: string;
  paginatedComments: { data: Comment[]; metadata: PaginationMetadata };
  user: User;
};

export default function Comments({
  ticketId,
  paginatedComments,
  user,
}: CommentsProps) {
  const infiniteScrollRef = useRef<HTMLDivElement>(null);
  // Try: "0px" (trigger when visible), "100px" (early), "400px" (very early)
  const isInView = useInView(infiniteScrollRef, { margin: "200px" });

  const queryKey = ["comments", ticketId];
  const {
    data: commentsData,
    fetchNextPage,
    isFetchingNextPage,
    isFetching,
    hasNextPage,
    isError,
  } = useInfiniteQuery({
    queryKey: queryKey,
    queryFn: ({ pageParam }) => getComments(ticketId, pageParam),
    initialPageParam: undefined as
      | { id: string; createdAt: number }
      | undefined,
    getNextPageParam: (lastPage) =>
      lastPage.metadata.hasNextPage ? lastPage.metadata.cursor : undefined,

    initialData: {
      pages: [paginatedComments],
      pageParams: [undefined],
    },
  });
  const queryClient = useQueryClient();
  const isWorking = isFetchingNextPage || isFetching;

  useEffect(() => {
    if (isInView && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isInView]);

  const comments = commentsData?.pages.flatMap((page) => page.data) ?? [];

  // Optimistic update handlers with proper error handling
  const handleDeleteComment = (commentId: string) => {
    queryClient.setQueryData(queryKey, (oldData: typeof commentsData) => {
      if (!oldData) return oldData;

      return {
        pages: oldData.pages.map((page) => ({
          ...page,
          data: page.data.filter((comment) => comment.id !== commentId),
        })),
        pageParams: oldData.pageParams, // Preserve pagination params
      };
    });

    // Optional: Mark as stale for background sync
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey, refetchType: "none" });
    }, 1000);
  };

  const handleUpsertComment = (newComment?: Comment) => {
    if (!newComment) return;

    queryClient.setQueryData(queryKey, (oldData: typeof commentsData) => {
      if (!oldData) return oldData;

      const commentExists = oldData.pages.some((page) =>
        page.data.some((comment) => comment.id === newComment.id),
      );

      if (commentExists) {
        // Update existing comment in-place
        return {
          pages: oldData.pages.map((page) => ({
            ...page,
            data: page.data.map((comment) =>
              comment.id === newComment.id ? newComment : comment,
            ),
          })),
          pageParams: oldData.pageParams, // Preserve pagination params
        };
      } else {
        // Add new comment to first page
        const [firstPage, ...restPages] = oldData.pages;
        return {
          pages: [
            {
              ...firstPage,
              data: [newComment, ...firstPage.data],
            },
            ...restPages,
          ],
          pageParams: oldData.pageParams, // Preserve pagination params
        };
      }
    });

    // Optional: Mark as stale for background sync
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey, refetchType: "none" });
    }, 1000);
  };

  const LoadingSpinner = (
    <motion.div
      key={"loading-more-comments"}
      initial={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
      layout="position"
      className="flex h-10 items-center justify-center will-change-transform"
    >
      <Spinner size="md" />
    </motion.div>
  );
  const NoMoreComments = (
    <motion.div
      key={"no-more-comments"}
      layout="position"
      initial={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
      className="flex h-10 items-center justify-center will-change-transform"
    >
      <p className="text-muted-foreground">No more comments</p>
    </motion.div>
  );
  const NoComments = (
    <motion.div
      key={"no-comments"}
      layout="position"
      initial={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.9, filter: "blur(6px)" }}
      className="flex h-10 items-center justify-center will-change-transform"
    >
      <p className="text-muted-foreground">
        Be the first to comment on this ticket
      </p>
    </motion.div>
  );

  const getFooterContent = () => {
    if (isWorking) return LoadingSpinner;
    if (comments.length === 0) return NoComments;
    return NoMoreComments;
  };

  if (isError) {
    return (
      <div className="flex h-56 flex-col items-center justify-end text-center font-semibold text-red-600">
        <XCircleIcon className="size-10 text-red-700" />
        Error loading comments
      </div>
    );
  }

  return (
    <MotionConfig
      transition={{ type: "spring", duration: 0.4681, bounce: 0.05 }}
    >
      <div className="animate-fade-from-bottom flex h-full w-full max-w-xl flex-col gap-y-5 self-center">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create a comment</CardTitle>
            <CardDescription className="text-muted-foreground">
              Provide a concise comment for your solution.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CommentForm ticketId={ticketId} onSuccess={handleUpsertComment} />
          </CardContent>
        </Card>

        <div className="relative space-y-6">
          <AnimatePresence mode="popLayout" initial={false}>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <CommentItem
                  comment={comment}
                  isOwner={user?.id === comment.userId}
                  onDelete={handleDeleteComment}
                  onUpdate={handleUpsertComment}
                />
              </motion.div>
            ))}
          </AnimatePresence>

          <motion.div layout="position" className="relative">
            <div
              ref={infiniteScrollRef}
              className="pointer-events-none absolute bottom-0 h-10 w-full select-none"
              aria-hidden="true"
            />
            <AnimatePresence mode="popLayout" initial={false}>
              {getFooterContent()}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}
