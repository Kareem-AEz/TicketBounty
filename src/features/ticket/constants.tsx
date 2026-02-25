import { LucideCircleCheck, LucideFileText, LucidePencil } from "lucide-react";

export const TICKET_STATUS_ICONS = {
  OPEN: <LucideFileText className="text-blue-500 dark:text-blue-400" />,
  IN_PROGRESS: (
    <LucidePencil className="text-amber-500 dark:text-amber-400" />
  ),
  DONE: (
    <LucideCircleCheck className="text-emerald-500 dark:text-emerald-400" />
  ),
};

export const TICKET_STATUS_LABELS = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export const TICKET_PAGE_SIZE = [10, 20, 50, 100];
