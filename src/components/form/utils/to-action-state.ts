import { z } from "zod/v4";
import { copy } from "@/lib/copy";

export type ActionState<T = unknown> = {
  status?: "SUCCESS" | "ERROR";
  message: string;
  payload?: FormData;
  fieldErrors?: Record<string, string[] | undefined>;
  timestamp: number;
  ticketId?: string;
  data?: T;
};

export const EMPTY_ACTION_STATE: ActionState<unknown> = {
  status: undefined,
  message: "",
  payload: undefined,
  fieldErrors: undefined,
  timestamp: Date.now(),
  ticketId: undefined,
  data: undefined,
};

export const toErrorActionState = <T>(
  error: unknown,
  formData?: FormData,
): ActionState<T> => {
  // Zod errors
  if (error instanceof z.ZodError) {
    return {
      status: "ERROR",
      message: "",
      payload: formData,
      fieldErrors: z.flattenError(error).fieldErrors,
      timestamp: Date.now(),
      ticketId: undefined,
      data: undefined as T | undefined,
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
      data: undefined as T | undefined,
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
    data: undefined as T | undefined,
  };
};

export const toSuccessActionState = <T>({
  status,
  message,
  payload,
  ticketId,
  data,
}: {
  status: ActionState["status"];
  message: string;
  payload?: FormData;
  ticketId?: string;
  data?: T;
}): ActionState<T> => {
  return {
    status,
    message,
    fieldErrors: undefined,
    timestamp: Date.now(),
    payload,
    ticketId,
    data,
  };
};
