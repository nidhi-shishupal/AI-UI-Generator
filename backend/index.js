import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import rateLimit from "express-rate-limit";
import generateRoute from "./routes/generate.js";
import explainRoute from "./routes/explain.js";
import { requestLogger } from "./middlewares/logger.js";
import { errorHandler } from "./middlewares/errorHandler.js";
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
  try {
    const { userPrompt, previousPlan } = req.body;

    if (!userPrompt) {
      const err = new Error("Prompt is required");
      err.statusCode = 400;
      throw err;
    }

    console.log("---- PLAN REQUEST ----");
    console.log("Prompt:", userPrompt);

    /* ---------------- INTENT DETECTION (FAST + RELIABLE) ---------------- */

    const text = userPrompt.toLowerCase();

    let intent = "default";
    let action = "create";

    if (
      text.includes("add") ||
      text.includes("remove") ||
      text.includes("change") ||
      text.includes("update") ||
      text.includes("make") ||
      text.includes("replace")
    ) {
      action = "edit";
    }

    // AUTH SCREENS
    if (
      text.match(/login|sign in|signin|authentication|auth/)
    ) {
      intent = "login";
    }

    // REGISTRATION
    else if (
      text.match(/register|signup|sign up|create account/)
    ) {
      intent = "register";
    }

    // CONTACT / INPUT FORMS
    else if (
      text.match(/contact|feedback|form|apply|submit details/)
    ) {
      intent = "form";
    }

    // DASHBOARD
    else if (
      text.match(/dashboard|admin panel|analytics|control panel/)
    ) {
      intent = "dashboard";
    }

    // SEARCH UI
    else if (
      text.match(/search|filter|find|lookup/)
    ) {
      intent = "search";
    }

    else if (text.match(/profile|account details|user info/)) {
      intent = "profile";
    }
    else if (text.match(/settings|preferences|change password/)) {
      intent = "settings";
    }
    else if (text.match(/table|list|records|data list|users list/)) {
      intent = "list";
    }
    else if (text.match(/landing|homepage|home page|marketing page/)) {
      intent = "landing";
    }
    else if (text.match(/popup|modal|dialog/)) {
      intent = "modal";
    }
    else if (text.match(/contact us|support page|help form/)) {
      intent = "contact";
    }

    /* ---------------- PLAN BUILDER ---------------- */

    function buildPlan(intent) {
      if (previousPlan && intent === "login" && userPrompt.includes("forgot")) {
        const updated = JSON.parse(JSON.stringify(previousPlan));

        updated.components[0].children.push({
          type: "Button",
          props: { label: "Forgot Password" },
          children: []
        });

        return updated;
      }
      switch (intent) {

        case "login":
          return {
            layout: "centered-card",
            components: [
              {
                type: "Card",
                props: { title: "Login" },
                children: [
                  { type: "Input", props: { label: "Email" }, children: [] },
                  { type: "Input", props: { label: "Password" }, children: [] },
                  { type: "Button", props: { label: "Submit" }, children: [] }
                ]
              }
            ]
          };

        case "form":
          return {
            layout: "single-column",
            components: [
              { type: "Input", props: { label: "Name" }, children: [] },
              { type: "Input", props: { label: "Email" }, children: [] },
              { type: "Button", props: { label: "Submit" }, children: [] }
            ]
          };

        case "register":
          return {
            layout: "centered-card",
            components: [
              {
                type: "Card",
                props: { title: "Create Account" },
                children: [
                  { type: "Input", props: { label: "Name" }, children: [] },
                  { type: "Input", props: { label: "Email" }, children: [] },
                  { type: "Input", props: { label: "Password" }, children: [] },
                  { type: "Button", props: { label: "Register" }, children: [] }
                ]
              }
            ]
          };

        case "search":
          return {
            layout: "single-column",
            components: [
              { type: "Input", props: { label: "Search..." }, children: [] },
              { type: "Button", props: { label: "Find" }, children: [] }
            ]
          };

        case "dashboard":
          return {
            layout: "dashboard",
            components: [
              { type: "Card", props: { title: "Users" }, children: [] },
              { type: "Card", props: { title: "Revenue" }, children: [] },
              { type: "Card", props: { title: "Performance" }, children: [] }
            ]
          };

        case "profile":
          return {
            layout: "single-column",
            components: [
              { type: "Input", props: { label: "Full Name" }, children: [] },
              { type: "Input", props: { label: "Email" }, children: [] },
              { type: "Button", props: { label: "Update Profile" }, children: [] }
            ]
          };

        case "settings":
          return {
            layout: "single-column",
            components: [
              { type: "Input", props: { label: "New Password" }, children: [] },
              { type: "Input", props: { label: "Confirm Password" }, children: [] },
              { type: "Button", props: { label: "Save Settings" }, children: [] }
            ]
          };

        case "list":
          return {
            layout: "dashboard",
            components: [
              { type: "Card", props: { title: "User 1" }, children: [] },
              { type: "Card", props: { title: "User 2" }, children: [] },
              { type: "Card", props: { title: "User 3" }, children: [] }
            ]
          };

        case "landing":
          return {
            layout: "centered-card",
            components: [
              {
                type: "Card",
                props: { title: "Welcome" },
                children: [
                  {
                    type: "Button",
                    props: { label: "Get Started" },
                    children: []
                  }
                ]
              }
            ]
          };


        case "modal":
          return {
            layout: "centered-card",
            components: [
              {
                type: "Card",
                props: { title: "Confirmation" },
                children: [
                  { type: "Button", props: { label: "Confirm" }, children: [] },
                  { type: "Button", props: { label: "Cancel" }, children: [] }
                ]
              }
            ]
          };

        case "contact":
          return {
            layout: "single-column",
            components: [
              { type: "Input", props: { label: "Name" }, children: [] },
              { type: "Input", props: { label: "Email" }, children: [] },
              { type: "Input", props: { label: "Message" }, children: [] },
              { type: "Button", props: { label: "Send Message" }, children: [] }
            ]
          };

        default:
          console.log("Fallback UI used");

          return {
            layout: "centered-card",
            components: [
              {
                type: "Card",
                props: { title: "AI Generated UI" },
                children: [
                  { type: "Input", props: { label: "Text" }, children: [] },
                  { type: "Button", props: { label: "Submit" }, children: [] }
                ]
              }
            ]
          };
      }
    }

    function editPlan(existingPlan, text) {
      if (!existingPlan) return buildPlan(intent);

      const plan = JSON.parse(JSON.stringify(existingPlan));

      // Add remember me
      if (text.includes("remember")) {
        plan.components[0].children.push({
          type: "Input",
          props: { label: "Remember Me" },
          children: []
        });
      }

      // Add confirm password
      if (text.includes("confirm password")) {
        plan.components[0].children.push({
          type: "Input",
          props: { label: "Confirm Password" },
          children: []
        });
      }

      // Remove button
      if (text.includes("remove button")) {
        plan.components[0].children =
          plan.components[0].children.filter(c => c.type !== "Button");
      }

      // Change title
      if (text.includes("signup")) {
        plan.components[0].props.title = "Sign Up";
      }

      return plan;
    }

    let plan;

    if (action === "edit" && previousPlan) {
      console.log("Editing existing UI...");
      plan = editPlan(previousPlan, text);
    } else {
      console.log("Creating new UI...");
      plan = buildPlan(intent);
    }

    res.json({ plan });

  } catch (error) {
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