export * as Donation from "./donation";
import { z } from "zod";

import { event } from "./event";
export const Events = {
    Created: event(
      "donation.received",
      z.object({
        to:z.string(),
        network: z.string(),
        value: z.number(),
        from: z.string(),
        asset: z.string(),
      })
    ),
};