import React from "react";
import { getComments } from "../queries/get-comments";
import CommentItem from "./comment-item";

export default async function Comments({ ticketId }: { ticketId: string }) {
  const comments = await getComments(ticketId);

  return (
    <div className="animate-fade-from-bottom flex w-full max-w-xl flex-col gap-y-4 self-center pl-4">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
}
