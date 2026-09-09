# Naaguru

A web platform for students and parents to understand suitable career paths after 10th grade, receive personalized career/stream recommendations, discover suitable colleges, and submit enquiries.

## Architecture
This project uses a Modular Monolith architecture. The backend serves a versioned REST API (`/api/v1/`) that will be consumed by two clients:
1. **Next.js Web Application**
2. **Flutter Mobile Application**

It utilizes PostgreSQL for the database and Supabase for backend services (Auth/Database where appropriate), with strict abstraction to ensure future portability away from Supabase to a standalone PostgreSQL instance.

## Developer Basics (How to Run Locally)

**1. Configuration**
The application relies on environment variables (like your database connection).
- Look at `.env.example` to see what variables are needed.
- Create a file named `.env` or `.env.local` in the root folder and copy the contents of `.env.example` into it, filling in the real values.
- *Never* commit your `.env` file to Git!

**2. Available Commands**
Run these commands in your terminal to develop and verify your code:
- `npm run dev` — Starts the Next.js local development server (usually at `http://localhost:3000`).
- `npm run typecheck` — Checks your TypeScript code for type errors without building.
- `npm run lint` — Checks your code for formatting and styling issues.
- `npm run test` — Runs the automated Vitest test suite.
- `npm run build` — Builds the application for production (useful to verify everything compiles).

**3. Logs and Debugging**
When you run `npm run dev`, you will see server logs in your terminal.
- Each incoming API request is automatically assigned a **Request ID** (e.g., `req-123`).
- This ID is logged in the terminal and returned in the HTTP response headers (`x-request-id`).
- If the Flutter app or web frontend encounters an error, you can use this ID to find the exact error in your terminal logs.

**4. API Error Format**
If an API request fails, it will always return a predictable JSON structure so the client can handle it easily:
```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Invalid input data",
    "requestId": "req-123"
  }
}
```

## Project Structure
- `src/app/api/v1`: Versioned REST API endpoints for Next.js Web and Flutter clients.
- `src/app`: Next.js App Router (Web Client)
- `src/modules`: Core business logic domains (student, assessment, career, college, matching, enquiry). Separated into `domain`, `application`, and `infrastructure` layers.
- `src/shared`: Shared infrastructure (database, auth, validation, errors).
- `src/components`: Shared UI components for the web client.
- `src/config`: Application-wide configuration.

## Guidelines
See `AGENTS.md` for AI agent instructions and architectural guidelines.
