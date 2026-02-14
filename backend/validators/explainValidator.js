import { z } from "zod";

export const explainSchema = z.object({
    userPrompt: z.string().min(1, "userPrompt is required"),
    plan: z.object({
        layout: z.string().optional(),
        components: z.array(z.any())
    })
});
