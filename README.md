# ⚡ AI UI Generator

An AI‑assisted UI builder that converts natural language prompts into a structured UI layout, renders a live preview, generates JSX code, and explains the interface structure.

The project works completely offline using local LLMs (Ollama) and a custom rule‑based planner for speed and reliability.

---

## 🚀 Features

* 🧠 Prompt → UI Plan (intent detection + fallback AI classification)
* 🧱 Component‑based renderer (Card, Input, Button, Modal)
* 👀 Live Preview with device switch (desktop/tablet/mobile)
* 🧾 JSX Code generation
* 📖 Human‑readable UI explanation
* 🕓 Version history & rollback
* 💡 Prompt suggestions & recent prompts
* 🔒 Sanitized and validated plans (Zod + security filters)
* ⚡ Works without OpenAI API (runs locally via Ollama)

---

## 🏗️ Architecture

### Frontend (React)

* Dynamic component renderer
* Inspector panel (JSON + explanation)
* Prompt assistant UI
* Responsive preview simulator

### Backend (Node.js + Express)

* `/plan` → Builds UI structure
* `/generate` → Converts plan to JSX
* `/explain` → Generates human explanation
* Input validation & sanitization
* Depth & component limits for safety

### AI Layer

Hybrid approach:

1. Fast rule‑based intent detection
2. Fallback LLM classification (Ollama)

---

## 🧩 Supported UI Types

* Login Form
* Forms
* Dashboard
* Cards
* Settings / Modal layouts
* Generic fallback UI

---

## 🛠️ Tech Stack

**Frontend**

* React
* Inline styling (glassmorphism UI)
* react‑tsparticles

**Backend**

* Node.js
* Express
* Zod validation
* Rate limiting & sanitization

**AI**

* Ollama (local LLM)

---

## ⚙️ Setup Instructions

### 1. Clone Repository

```
git clone <repo_url>
cd ai-ui-generator
```

### 2. Backend Setup

```
cd backend
npm install
```

Create `.env`

```
OLLAMA_URL=http://localhost:11434/api/generate
PORT=5000
```

Start server:

```
node index.js
```

### 3. Frontend Setup

```
cd frontend
npm install
npm run dev
```

---

## 🧪 Example Prompts

* Login form with remember me
* Admin dashboard with stats cards
* User profile card
* Contact form with message box
* Settings page with modal

---

## 📌 Security Measures

* Allowed component whitelist
* Props filtering
* Max depth & component limits
* Zod schema validation
* Rate limiting

---
## 📄 License

This project is submitted as a technical assignment and is intended for educational evaluation purposes.