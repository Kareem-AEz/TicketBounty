import { LucideSkull, LucideUser } from "lucide-react";
import React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Comment } from "../type";

export default function CommentItem({ comment }: { comment: Comment }) {
  const isDeleted = !comment.user;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-muted-foreground flex items-center gap-x-2 text-sm font-bold">
          {isDeleted ? (
            <LucideSkull className="size-5" />
          ) : (
            <LucideUser className="size-5" />
          )}
          <span>{isDeleted ? "Deleted User" : comment.user?.username}</span>
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
    </Card>
  );
}
