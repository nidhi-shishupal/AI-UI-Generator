import express from "express";
import { sanitizeComponent } from "../utils/sanitize.js";
import { explainSchema } from "../validators/explainValidator.js";

const router = express.Router();

const MAX_COMPONENTS = 30;
const MAX_TEXT_LENGTH = 5000;

/* -------- Recursive Component Reader -------- */

function describeComponent(component, depth = 0, list = []) {
    if (!component || depth > 5) return list;

    const label =
        component.props?.label ||
        component.props?.title ||
        "no label";

    list.push(
        `${" ".repeat(depth * 2)}• ${component.type} (${label})`
    );

    if (Array.isArray(component.children)) {
        component.children.forEach(child =>
            describeComponent(child, depth + 1, list)
        );
    }

    return list;
}

router.post("/", (req, res, next) => {
    try {

        /* -------- Validation -------- */

        const parseResult = explainSchema.safeParse(req.body);

        if (!parseResult.success) {
            return res.status(400).json({
                error: true,
                message: parseResult.error.errors[0].message
            });
        }

        const { plan, userPrompt } = parseResult.data;

        /* -------- Hard Safety -------- */

        if (!plan || !Array.isArray(plan.components)) {
            return res.json({
                explanation: "AI generated an empty interface."
            });
        }

        /* -------- Sanitize -------- */

        const safeComponents = plan.components
            .slice(0, MAX_COMPONENTS)
            .map(sanitizeComponent)
            .filter(Boolean);

        /* -------- Generate Explanation -------- */

        const explanationLines = [];

        explanationLines.unshift("🧠 AI understood your request and created this structure:\n");
        explanationLines.push(`User requested: ${userPrompt}`);
        explanationLines.push(`Layout used: ${plan.layout || "default"}`);
        explanationLines.push(`UI Structure:`);

        safeComponents.forEach(component => {
            describeComponent(component, 0, explanationLines);
        });

        const finalText = explanationLines.join("\n");

        if (finalText.length > MAX_TEXT_LENGTH) {
            return res.json({
                explanation: "UI is too large to explain."
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
