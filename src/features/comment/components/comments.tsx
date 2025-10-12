import React from "react";
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

export default async function Comments({ ticketId }: { ticketId: string }) {
  const comments = await getComments(ticketId);

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
          <CommentForm ticketId={ticketId} />
        </CardContent>
      </Card>

      <div className="space-y-5 pl-4">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
