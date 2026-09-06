# Naaguru

A web platform for students and parents to understand suitable career paths after 10th grade, receive personalized career/stream recommendations, discover suitable colleges, and submit enquiries.

## Architecture
This project uses a Modular Monolith architecture. The backend serves a versioned REST API (`/api/v1/`) that will be consumed by two clients:
1. **Next.js Web Application**
2. **Flutter Mobile Application**

It utilizes PostgreSQL for the database and Supabase for backend services (Auth/Database where appropriate), with strict abstraction to ensure future portability away from Supabase to a standalone PostgreSQL instance.

## Getting Started

1. Ensure you have Node.js (v24+) installed.
2. Clone the repository and run `npm install`.
3. Copy `.env.example` to `.env.local` and configure your environment variables.
4. Run `npm run dev` to start the development server.

## Project Structure
- `src/app/api/v1`: Versioned REST API endpoints for Next.js Web and Flutter clients.
- `src/app`: Next.js App Router (Web Client)
- `src/modules`: Core business logic domains (student, assessment, career, college, matching, enquiry). Separated into `domain`, `application`, and `infrastructure` layers.
- `src/shared`: Shared infrastructure (database, auth, validation, errors).
- `src/components`: Shared UI components for the web client.
- `src/config`: Application-wide configuration.

## Guidelines
See `AGENTS.md` for AI agent instructions and architectural guidelines.
