# SYNTRA Pro - Health Tracker

SYNTRA is a professional, tech-forward health tracking application built for **Triune Dynamic Limited**. It features a modern dark-mode UI with glassmorphism, rule-based health insights, and a secure Node.js backend.

## Features

- **Professional UI**: Mobile-first, dark-mode design using Tailwind CSS 4, Framer Motion, and Lucide icons.
- **Daily Health Logs**: Track energy, mood, stress, symptoms, and diet with a few taps.
- **Insight Engine**: A rule-based correlation engine that identifies patterns.
- **Secure Backend**: Node.js/Express API with JWT authentication and input validation.
- **Permanent Storage**: SQLite database for persistent tracking.
- **Monorepo Structure**: Cleanly organized into web, api, and shared packages.

## Tech Stack

- **Frontend**: Next.js 16 (React 19), Tailwind CSS 4, Framer Motion.
- **Backend**: Node.js, Express, SQLite.
- **Logic**: Python (Rule-based Insight Engine).
- **Security**: JWT Authentication, Zod validation.

## Project Structure

```text
apps/
  web/       # Next.js Frontend
  api/       # Node.js Express Backend
packages/
  shared/    # Shared types and logic
```

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.9+

### Installation
1. Clone the repository
2. Run `npm install`

### Running the App
- **Backend**: `npm run dev --prefix apps/api`
- **Frontend**: `npm run dev --prefix apps/web`

## Security
This project uses JWT for secure authentication. Set a `JWT_SECRET` environment variable in production.

---
Built with care by **SYNTRA** (for Triune Dynamic Limited).
