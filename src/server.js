import http from "http";
import express from "express";
import connectDB from "./utils/db.js";
import v1Routes from "./v1/routes/index.js";
import docsRoutes from "./v1/routes/docsRoutes.js";

import "./jobs/reminderJobs.js";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import { setSocketServer } from "./realtime/socketServer.js";
import { verifyAccessToken } from "./utils/authTokens.js";
import Account from "./models/Account.js";

const app = express();
const port = env.port;
const server = http.createServer(app);
let SocketIOServer = null;

try {
  ({ Server: SocketIOServer } = await import("socket.io"));
} catch (_error) {
  console.warn("socket.io is not installed yet. Realtime features are temporarily disabled.");
}

const PROBLEM_PAGE_CONTENT = {
  "account-not-found": {
    title: "Account Not Found",
    status: 404,
    detail:
      "We could not find an AYOMAMA account with the email address you entered. Please check the email and try again, or create a new account if you are new here.",
  },
  "invalid-credentials": {
    title: "Invalid Credentials",
    status: 401,
    detail:
      "The login details provided were not accepted. Please confirm your email and password, then try again.",
  },
  "incorrect-password": {
    title: "Incorrect Password",
    status: 401,
    detail:
      "The password entered for this account is incorrect. Please try again or reset your password if you have forgotten it.",
  },
  unauthorized: {
    title: "Unauthorized",
    status: 401,
    detail:
      "You must be signed in with a valid account to access this resource.",
  },
  "validation-error": {
    title: "Validation Failed",
    status: 422,
    detail:
      "The request could not be processed because one or more fields were invalid.",
  },
  conflict: {
    title: "Conflict",
    status: 409,
    detail:
      "The request could not be completed because the resource already exists or conflicts with the current state.",
  },
  forbidden: {
    title: "Forbidden",
    status: 403,
    detail:
      "You do not have permission to perform this action.",
  },
  "invite-invalid": {
    title: "Invite Invalid",
    status: 400,
    detail:
      "This invite is invalid, expired, or has already been used.",
  },
  "otp-invalid": {
    title: "Invalid OTP",
    status: 400,
    detail:
      "The one-time code entered is incorrect.",
  },
  "otp-expired": {
    title: "OTP Expired",
    status: 400,
    detail:
      "This one-time code has expired. Please request a new code and try again.",
  },
  "too-many-requests": {
    title: "Too Many Requests",
    status: 429,
    detail:
      "Too many requests were made in a short period. Please wait a moment and try again.",
  },
  "server-error": {
    title: "Server Error",
    status: 500,
    detail:
      "The request could not be completed due to an unexpected server issue.",
  },
};

function titleizeProblemSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

app.use((req, res, next) => {
  const allowedOrigins = [env.frontendUrl, env.adminUrl];
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  }
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());
app.use(cookieParser());

connectDB();

app.use("/api/v1/docs", docsRoutes);
app.use("/api/v1", v1Routes);

app.get("/problems/:problemType", (req, res) => {
  const { problemType } = req.params;
  const content =
    PROBLEM_PAGE_CONTENT[problemType] || {
      title: titleizeProblemSlug(problemType) || "Request Problem",
      status: 400,
      detail:
        "This link describes a problem response returned by the AYOMAMA backend.",
    };

  res.status(content.status).type("html").send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>${content.title} | AYOMAMA API</title>
        <style>
          body {
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background: linear-gradient(180deg, #b5fffc 0%, #ffdee9 100%);
            color: #042f40;
          }
          .shell {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
          }
          .card {
            width: 100%;
            max-width: 720px;
            background: rgba(255,255,255,0.92);
            border: 1px solid rgba(4,47,64,0.08);
            border-radius: 28px;
            box-shadow: 0 20px 60px rgba(4,47,64,0.12);
            padding: 32px;
          }
          .brand {
            font-size: 13px;
            font-weight: 700;
            letter-spacing: 0.14em;
            color: #0b7285;
            text-transform: uppercase;
            margin-bottom: 16px;
          }
          h1 {
            margin: 0 0 10px;
            font-size: 34px;
            line-height: 1.1;
          }
          .status {
            display: inline-flex;
            align-items: center;
            border-radius: 999px;
            background: #e6f8f7;
            color: #0b7285;
            font-weight: 700;
            font-size: 14px;
            padding: 8px 12px;
            margin-bottom: 20px;
          }
          p {
            font-size: 16px;
            line-height: 1.7;
            margin: 0 0 18px;
          }
          .meta {
            margin-top: 24px;
            padding: 16px;
            border-radius: 18px;
            background: #f8fafc;
            border: 1px solid rgba(4,47,64,0.08);
          }
          .meta strong {
            display: block;
            margin-bottom: 6px;
          }
          code {
            word-break: break-word;
            color: #0f766e;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <main class="shell">
          <section class="card">
            <div class="brand">AYOMAMA Backend</div>
            <div class="status">HTTP ${content.status}</div>
            <h1>${content.title}</h1>
            <p>${content.detail}</p>
            <div class="meta">
              <strong>Problem Link</strong>
              <code>${req.protocol}://${req.get("host")}${req.originalUrl}</code>
            </div>
          </section>
        </main>
      </body>
    </html>
  `);
});

app.get("/", (req, res) => {
  res.send({ message: "This is ayomama backend" });
});

if (SocketIOServer) {
  const io = new SocketIOServer(server, {
    cors: {
      origin: [env.frontendUrl, env.adminUrl],
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace("Bearer ", "");
      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const payload = verifyAccessToken(token);
      const account = await Account.findById(payload.sub);
      if (!account) {
        return next(new Error("Unauthorized"));
      }

      socket.data.account = account;
      return next();
    } catch (_error) {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    const account = socket.data.account;
    const accountRoom = `account:${account._id.toString()}`;
    socket.join(accountRoom);

    if (account.role === "mother") {
      socket.join(`mother:${account._id.toString()}`);
      socket.join(`partner-link:${account._id.toString()}`);
    }
  });

  setSocketServer(io);
} else {
  setSocketServer(null);
}

server.listen(port, () => {
  console.log(`server running on http://localhost:${port}`);
});

export default app;
