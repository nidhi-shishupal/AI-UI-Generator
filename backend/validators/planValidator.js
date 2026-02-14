import { z } from "zod";

const componentSchema = z.lazy(() =>
    z.object({
        type: z.enum(["Card", "Input", "Button", "Modal"]),
        props: z.record(z.string()).optional(),
        children: z.array(componentSchema).optional()
    })
);

export const planSchema = z.object({
    layout: z.string(),
    components: z.array(componentSchema).max(30)
});
