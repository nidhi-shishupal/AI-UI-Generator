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

        function normalizeComponent(component) {

            if (!component || !component.type) return null;

            const base = {
                type: component.type,
                props: component.props || {},
                children: Array.isArray(component.children) ? component.children : []
            };

            // Default props per component
            switch (base.type) {

                case "Card":
                    base.props.title ||= "Card";
                    break;

                case "Input":
                    base.props.label ||= "Input";
                    base.props.placeholder ||= base.props.label;
                    break;

                case "Button":
                    base.props.label ||= "Click";
                    break;

                case "Modal":
                    base.props.title ||= "Modal";
                    break;
            }

            base.children = base.children
                .map(normalizeComponent)
                .filter(Boolean);

            return base;
        }

        if (!Array.isArray(plan.components)) {
            const error = new Error("Plan.components must be an array");
            error.statusCode = 400;
            throw error;
        }

        /* -------- Sanitize & Secure -------- */

        const safeComponents = plan.components
            .slice(0, MAX_COMPONENTS)
            .map(normalizeComponent)
            .filter(Boolean)
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
