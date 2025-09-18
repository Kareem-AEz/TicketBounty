import z from "zod";
import { copy } from "@/lib/copy";

export type ActionState = {
  status?: "SUCCESS" | "ERROR";
  message: string;
  payload?: FormData;
  fieldErrors?: Record<string, string[] | undefined>;
  timestamp: number;
  ticketId?: string;
};

export const EMPTY_ACTION_STATE: ActionState = {
  status: undefined,
  message: "",
  payload: undefined,
  fieldErrors: undefined,
  timestamp: Date.now(),
  ticketId: undefined,
};

export const toErrorActionState = (
  error: unknown,
  formData?: FormData,
): ActionState => {
  // Zod errors
  if (error instanceof z.ZodError) {
    return {
      status: "ERROR",
      message: "",
      payload: formData,
      fieldErrors: z.flattenError(error).fieldErrors,
      timestamp: Date.now(),
      ticketId: undefined,
    };

    // Other errors
  } else if (error instanceof Error) {
    return {
      status: "ERROR",
      message: error.message,
      payload: formData,
      fieldErrors: undefined,
      timestamp: Date.now(),
      ticketId: undefined,
    };
  }

  // Default error
  return {
    status: "ERROR",
    message: `${copy.errors.general} - An unknown error occurred`,
    payload: formData,
    fieldErrors: undefined,
    timestamp: Date.now(),
    ticketId: undefined,
  };
};

export const toSuccessActionState = ({
  status,
  message,
  payload,
  ticketId,
}: {
  status: ActionState["status"];
  message: string;
  payload?: FormData;
  ticketId?: string;
}): ActionState => {
  return {
    status,
    message,
    fieldErrors: undefined,
    timestamp: Date.now(),
    payload,
    ticketId,
  };
};
