import { getComments } from "./queries/get-comments";

export type Comment = Awaited<ReturnType<typeof getComments>>[number];
