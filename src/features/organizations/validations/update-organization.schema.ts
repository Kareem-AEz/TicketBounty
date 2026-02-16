import { z } from "zod/v4";

export const updateOrganizationSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
});
