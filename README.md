# Ayomama Backend API

Node.js and Express backend for the Ayomama maternal health application.

## Current API

The active backend API is versioned under:

```text
http://localhost:3000/api/v1
```

Interactive API documentation is available at:

```text
http://localhost:3000/api/v1/docs
```

Legacy unversioned routes such as `/api/user`, `/api/visit`, `/api/chat`, `/api/patient`, `/api/reminder`, `/api/hospitals`, and `/api/antenatal` are no longer mounted.

## Getting Started

Install dependencies:

```bash
npm install
```

Create a `.env` file in the project root with the required backend values.

Run in development:

```bash
npm run dev
```

Run in production:

```bash
npm start
```

Seed auth/demo data:

```bash
npm run seed:auth
```

## Project Layout

```text
src/server.js          Express app entrypoint
src/v1                 Active versioned API routes, controllers, docs, and validation
src/models             Shared MongoDB models
src/middleware         Shared request middleware
src/utils              Shared utilities
src/jobs               Background reminder jobs
src/realtime           Socket.IO realtime wiring
src/services           External email/SMS service helpers
```

## Environment

Environment values are loaded from `.env` through `src/config/env.js`.

Common required values include:

```text
PORT
MONGO_URI
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
FRONTEND_URL
ADMIN_URL
GROQ_API_KEY
EXPO_ACCESS_TOKEN
```
