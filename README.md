# AI UI Generator

An AI powered UI builder that converts natural language prompts into structured UI layouts and live React preview.

## Live Application

http://localhost:5173/

## Features

- Prompt → UI Layout generation
- Live preview rendering
- JSX code generation
- Explanation generation
- Version history rollback
- Prompt history
- Device preview (desktop/tablet/mobile)
- Multiple layouts (card, dashboard, forms)
- Safe component sanitization

## Tech Stack

Frontend:
- React
- Custom component renderer
- Dynamic layout engine

Backend:
- Node.js
- Express
- OpenAI API

## How It Works

1. User enters UI description
2. Backend converts prompt → UI plan (JSON schema)
3. Plan is sanitized for security
4. React dynamically renders components
5. JSX code + explanation generated

## Architecture

Prompt → Plan API → Sanitize → Renderer → Generate → Explain

## Safety

Only allowed components rendered:
- Card
- Button
- Input
- Modal

Prevents arbitrary code execution.

## Example Prompts

- Login form with remember me
- Admin dashboard with stats
- User profile card
- Settings modal

## Run Locally

### Backend

cd backend
npm install
node index.js

### Frontend

cd frontend
npm install
npm run dev

Server runs at:
http://localhost:5000

