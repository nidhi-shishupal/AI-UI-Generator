import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import generateRoute from "./routes/generate.js";
import explainRoute from "./routes/explain.js";
import { requestLogger } from "./middlewares/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { planSchema } from "./validators/planValidator.js";
import fs from "fs";

dotenv.config();

const app = express();

let planHistory = [];
const HISTORY_FILE = "./planHistory.json";

// Load history on startup
if (fs.existsSync(HISTORY_FILE)) {
    const data = fs.readFileSync(HISTORY_FILE);
    planHistory = JSON.parse(data);
}

/* -------- Core Middleware -------- */

app.use(cors());
app.use(express.json());
app.use(requestLogger);

/* -------- Rate Limiting -------- */

app.use(
    rateLimit({
        windowMs: 60 * 1000,
        max: 30
    })
);

/* -------- Health Endpoint -------- */

app.get("/api/v1/health", (req, res) => {
    res.json({
        status: "OK",
        uptime: process.uptime(),
        timestamp: Date.now()
    });
});

/* -------- Routes -------- */

app.use("/api/v1/generate", generateRoute);
app.use("/api/v1/explain", explainRoute);

/* -------- Root -------- */

app.get("/", (req, res) => {
    res.send("AI UI Generator Backend Running");
});

/* -------- PLAN -------- */

function limitDepth(component, depth = 0, maxDepth = 3) {
    if (depth > maxDepth) return null;

    return {
        ...component,
        children: (component.children || [])
            .map(child => limitDepth(child, depth + 1, maxDepth))
            .filter(Boolean)
    };
}

app.post("/api/v1/plan", async (req, res, next) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 30000); // 30 sec

  try {
    const { userPrompt, previousPlan } = req.body;

    if (!userPrompt) {
      const err = new Error("Prompt is required");
      err.statusCode = 400;
      throw err;
    }

    console.log("---- PLAN REQUEST ----");
    console.log("Prompt:", userPrompt);
    console.log("Previous plan exists:", !!previousPlan);

    const messages = [
      {
        role: "system",
        content: `
You are a UI planner.

Return STRICT JSON only in this format:

{
  "layout": "single-column | centered-card | two-column | dashboard",
  "components": [
    {
      "type": "Card | Input | Button | Modal",
      "props": {},
      "children": []
    }
  ]
}

Rules:
- Card and Modal use "title"
- Input and Button use "label"
- Preserve previous plan if provided
- Return ONLY valid JSON
`
      }
    ];

    if (previousPlan) {
      messages.push({
        role: "system",
        content: `Current UI:\n${JSON.stringify(previousPlan)}`
      });
    }

    messages.push({
      role: "user",
      content: userPrompt
    });

    const response = await fetch(process.env.OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "phi",
        messages,
        stream: false
      }),
      signal: controller.signal
    });

    const data = await response.json();

    clearTimeout(timeout); 

    if (!data?.message?.content) {
      throw new Error("Invalid AI response");
    }

    const parsed = JSON.parse(data.message.content);

    res.json({ plan: parsed });

  } catch (error) {
    clearTimeout(timeout); 

    if (error.name === "AbortError") {
      return next(
        Object.assign(new Error("AI request timed out"), {
          statusCode: 504
        })
      );
    }

    next(error);
  }
});

/* -------- Global Error Handler -------- */

app.use(errorHandler);

/* -------- Server -------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});