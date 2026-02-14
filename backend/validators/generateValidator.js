import { z } from "zod";

export const generateSchema = z.object({
    plan: z.object({
        layout: z.string().optional(),
        components: z.array(z.any())
    })
});
