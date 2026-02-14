import express from "express";
import { sanitizeComponent } from "../utils/sanitize.js";
import { explainSchema } from "../validators/explainValidator.js";

const router = express.Router();

const MAX_COMPONENTS = 20;
const MAX_TEXT_LENGTH = 5000;

router.post("/", (req, res, next) => {
    try {
        /* -------- Zod Validation -------- */

        const parseResult = explainSchema.safeParse(req.body);

        if (!parseResult.success) {
            return res.status(400).json({
                error: true,
                message: parseResult.error.errors[0].message
            });
        }

        const { plan, userPrompt } = parseResult.data;

        /* -------- Sanitize -------- */

        const safeComponents = plan.components
            .slice(0, MAX_COMPONENTS)
            .map(sanitizeComponent)
            .filter(Boolean);

        /* -------- Generate Explanation -------- */

        const explanation = [
            `User intent: "${userPrompt}"`,
            `Layout: ${plan.layout || "default"}`
        ];

        safeComponents.forEach((component, index) => {
            const label =
                component.props?.label ||
                component.props?.title ||
                "N/A";

            explanation.push(
                `Component ${index + 1}: ${component.type} with value "${label}".`
            );
        });

        const finalText = explanation.join("\n");

        if (finalText.length > MAX_TEXT_LENGTH) {
            return res.status(500).json({
                error: true,
                message: "Explanation too large"
            });
        }

        res.json({
            explanation: finalText
        });

    } catch (error) {
        error.statusCode = 500;
        next(error);
    }
});

export default router;