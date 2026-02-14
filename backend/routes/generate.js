import express from "express";
import { generateJSX } from "../utils/generateJSX.js";
import { sanitizeComponent } from "../utils/sanitize.js";
import { generateSchema } from "../validators/generateValidator.js";

const router = express.Router();

const MAX_COMPONENTS = 20;
const MAX_DEPTH = 3;

/* -------- Depth Limiter -------- */
function limitDepth(component, depth = 0) {
    if (depth > MAX_DEPTH) return null;

    return {
        ...component,
        children: (component.children || [])
            .map(child => limitDepth(child, depth + 1))
            .filter(Boolean)
    };
}

router.post("/", (req, res, next) => {
    try {
        /* -------- Validation -------- */

        const parseResult = generateSchema.safeParse(req.body);

        if (!parseResult.success) {
            const error = new Error(parseResult.error.issues[0].message);
            error.statusCode = 400;
            throw error;
        }

        const { plan } = parseResult.data;

        if (!Array.isArray(plan.components)) {
            const error = new Error("Plan.components must be an array");
            error.statusCode = 400;
            throw error;
        }

        /* -------- Sanitize & Secure -------- */

        const safeComponents = plan.components
            .slice(0, MAX_COMPONENTS)
            .map(sanitizeComponent)
            .filter(Boolean)
            .map(component => limitDepth(component));

        /* -------- Generate JSX -------- */

        const jsx = safeComponents
            .map(generateJSX)
            .join("\n");

        res.json({
            code: jsx
        });

    } catch (error) {
        next(error);
    }
});

export default router;
