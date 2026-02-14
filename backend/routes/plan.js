import express from "express";
import { callOllama } from "../services/ollamaService.js";
import { sanitizeComponent } from "../utils/sanitize.js";
import { planSchema } from "../validators/planValidator.js";

const router = express.Router();

const MAX_COMPONENTS = 20;
const MAX_DEPTH = 3;

function limitDepth(component, depth = 0) {
    if (depth > MAX_DEPTH) return null;

    return {
        ...component,
        children: (component.children || [])
            .map(child => limitDepth(child, depth + 1))
            .filter(Boolean)
    };
}

router.post("/", async (req, res, next) => {
    try {
        const parseResult = planSchema.safeParse(req.body);

        if (!parseResult.success) {
            return res.status(400).json({
                error: true,
                message: parseResult.error.errors[0].message
            });
        }

        const { userPrompt } = parseResult.data;


        if (userPrompt.length > 1000) {
            return res.status(400).json({
                error: true,
                message: "Prompt too long"
            });
        }

        /* ---------- Call AI Service ---------- */

        const raw = await callOllama(`
Return STRICT JSON in this format:

{
  "layout": "string",
  "components": []
}

Do not include explanation.
Do not include markdown.
Only JSON.

User request:
${userPrompt}
`);

        if (!raw) {
            return res.status(502).json({
                error: true,
                message: "Empty response from AI"
            });
        }

        /* ---------- Extract JSON ---------- */

        const jsonMatch = raw.match(/\{[\s\S]*\}/);

        if (!jsonMatch) {
            return res.status(400).json({
                error: true,
                message: "AI did not return valid JSON"
            });
        }

        let parsed;

        try {
            parsed = JSON.parse(jsonMatch[0]);
        } catch {
            return res.status(400).json({
                error: true,
                message: "Failed to parse AI JSON"
            });
        }

        /* ---------- Structure Enforcement ---------- */

        if (!Array.isArray(parsed.components)) {
            parsed.components = [];
        }

        parsed.layout = typeof parsed.layout === "string"
            ? parsed.layout
            : "default";

        /* ---------- Sanitization ---------- */

        parsed.components = parsed.components
            .slice(0, MAX_COMPONENTS)
            .map(sanitizeComponent)
            .filter(Boolean)
            .map(component => limitDepth(component));

        /* ---------- Final Response ---------- */

        res.json({
            plan: {
                layout: parsed.layout,
                components: parsed.components
            }
        });

    } catch (error) {
        error.statusCode = 500;
        next(error);
    }
});

export default router;
