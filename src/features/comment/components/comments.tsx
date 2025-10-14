"use client";

import { User } from "lucia";
import { motion } from "motion/react";
import React, { useState } from "react";
import SubmitButton from "@/components/form/submit-button";
import { PaginationMetadata } from "@/components/pagination";
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
  const [comments, setComments] = useState(paginatedComments.data);
  const [commentsMetadata, setCommentsMetadata] = useState(
    paginatedComments.metadata,
  );
  const [isLoading, setIsLoading] = useState(false);

  // Load more comments
  async function handleLoadMore() {
    setIsLoading(true);
    const newComments = await getComments(ticketId, comments.length);
    setComments((prev) => [...prev, ...newComments.data]);
    setCommentsMetadata((prev) => ({
      ...prev,
      hasNextPage: newComments.metadata.hasNextPage,
    }));
    setIsLoading(false);
  }

  // Handle Delete Comment
  async function handleDeleteComment(commentId: string) {
    setComments((prev) => prev.filter((comment) => comment.id !== commentId));
  }

  // Handle Add Comment
  async function handleAddComment(comment: Comment | undefined) {
    if (comment) setComments((prev) => [comment, ...prev]);
  }

  return (
    <div className="animate-fade-from-bottom flex w-full max-w-xl flex-col gap-y-5 self-center">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Create a comment</CardTitle>
          <CardDescription className="text-muted-foreground">
            Provide a concise comment for your solution.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CommentForm ticketId={ticketId} onSuccess={handleAddComment} />
        </CardContent>
      </Card>

      <div className="space-y-5">
        {comments.map((comment) => (
          <motion.div key={comment.id} layout="position">
            <CommentItem
              comment={comment}
              isOwner={user?.id === comment.userId}
              onDelete={() => handleDeleteComment(comment.id)}
            />
          </motion.div>
        ))}
      </div>

      <SubmitButton
        variant={"outline"}
        size={"lg"}
        onClick={handleLoadMore}
        pending={isLoading}
        pendingLabel="Loading more..."
        disabled={!commentsMetadata.hasNextPage || isLoading}
        aria-disabled={!commentsMetadata.hasNextPage || isLoading}
      >
        Load more
      </SubmitButton>
    </div>
  );
}
