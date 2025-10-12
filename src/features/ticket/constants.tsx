import { LucideCircleCheck, LucideFileText, LucidePencil } from "lucide-react";

export const TICKET_STATUS_ICONS = {
  OPEN: <LucideFileText />,
  IN_PROGRESS: <LucidePencil />,
  DONE: <LucideCircleCheck />,
};

export const TICKET_STATUS_LABELS = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  DONE: "Done",
};

export const TICKET_PAGE_SIZE = [10, 20, 50, 100];
