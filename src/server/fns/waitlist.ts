import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { servicesFetch } from "#/lib/services/client";

export const joinWaitlist = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().email(),
      turnstileToken: z.string(),
      source: z.string().optional(),
    }),
  )
  .handler(async ({ data: input }) => {
    return servicesFetch<{ ok: true }>("/waitlist", {
      method: "POST",
      body: JSON.stringify(input),
    });
  });
