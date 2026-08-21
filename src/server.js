import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import express from "express";
import cookieParser from "cookie-parser";
import {
  addSignup,
  countSignups,
  listSignups,
  openDb,
  signupExists,
} from "./db.js";
import { adminLoginPage, adminPage, publicPage } from "./views.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");
const IS_PROD =
  process.env.NODE_ENV === "production" ||
  Boolean(process.env.RAILWAY_ENVIRONMENT);
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || "").trim();

if (IS_PROD && (!ADMIN_PASSWORD || ADMIN_PASSWORD === "changeme")) {
  console.error(
    "Refusing to start: set ADMIN_PASSWORD to a strong secret (not changeme)."
  );
  process.exit(1);
}

const resolvedAdminPassword = ADMIN_PASSWORD || "changeme";
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  crypto
    .createHash("sha256")
    .update(`waitlist:${resolvedAdminPassword}`)
    .digest("hex");

const config = {
  siteName: process.env.SITE_NAME || "Waitlist",
  headline: process.env.HEADLINE || "Something worth waiting for",
  support:
    process.env.SUPPORT_TEXT ||
    "Leave your email. Be first when we open the doors.",
  cta: process.env.CTA_TEXT || "Join the list",
  accent: process.env.ACCENT_COLOR || "#D4A574",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COOKIE_NAME = "wl_admin";
const JOIN_WINDOW_MS = 60_000;
const JOIN_MAX_PER_WINDOW = 8;
const joinHits = new Map();

const db = openDb(DATA_DIR);
const app = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "32kb" }));
app.use(cookieParser(SESSION_SECRET));
app.use(express.static(path.join(__dirname, "public")));

function signToken() {
  return crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(`admin:${resolvedAdminPassword}`)
    .digest("hex");
}

function clientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.socket.remoteAddress || "unknown";
}

function allowJoin(ip) {
  const now = Date.now();
  const recent = (joinHits.get(ip) || []).filter(
    (stamp) => now - stamp < JOIN_WINDOW_MS
  );
  if (recent.length >= JOIN_MAX_PER_WINDOW) {
    joinHits.set(ip, recent);
    return false;
  }
  recent.push(now);
  joinHits.set(ip, recent);
  return true;
}

function isAuthed(req) {
  const token = req.signedCookies?.[COOKIE_NAME];
  if (!token) return false;
  const expected = signToken();
  try {
    return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}

function requireAdmin(req, res, next) {
  if (isAuthed(req)) return next();
  return res.redirect("/admin");
}

app.get("/health", (_req, res) => {
  res.status(200).type("text/plain").send("ok");
});

app.get("/", (req, res) => {
  const flash = req.query.joined
    ? { type: "ok", message: "You are on the list. We will be in touch." }
    : req.query.exists
      ? { type: "ok", message: "You are already on the list." }
      : req.query.rate
        ? {
            type: "error",
            message: "Too many attempts. Wait a minute and try again.",
          }
        : req.query.error
          ? { type: "error", message: "Enter a valid email to join." }
          : null;
  res.type("html").send(publicPage(config, flash));
});

app.post("/join", (req, res) => {
  if (!allowJoin(clientIp(req))) {
    return res.redirect("/?rate=1");
  }
  const email = String(req.body?.email || "").trim();
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return res.redirect("/?error=1");
  }
  if (signupExists(db, email)) {
    return res.redirect("/?exists=1");
  }
  try {
    addSignup(db, email);
  } catch (err) {
    if (String(err?.message || "").includes("UNIQUE")) {
      return res.redirect("/?exists=1");
    }
    console.error(err);
    return res.redirect("/?error=1");
  }
  return res.redirect("/?joined=1");
});

app.get("/admin", (req, res) => {
  if (isAuthed(req)) {
    const signups = listSignups(db);
    const total = countSignups(db);
    return res.type("html").send(adminPage(config, signups, total));
  }
  return res.type("html").send(adminLoginPage(config, null));
});

app.post("/admin/login", (req, res) => {
  const password = String(req.body?.password || "");
  const expected = Buffer.from(resolvedAdminPassword);
  const got = Buffer.from(password);
  let ok = false;
  if (expected.length === got.length) {
    ok = crypto.timingSafeEqual(expected, got);
  }
  if (!ok) {
    return res
      .status(401)
      .type("html")
      .send(adminLoginPage(config, "Wrong password. Check ADMIN_PASSWORD."));
  }
  res.cookie(COOKIE_NAME, signToken(), {
    httpOnly: true,
    sameSite: "lax",
    signed: true,
    secure: process.env.NODE_ENV === "production" || Boolean(process.env.RAILWAY_ENVIRONMENT),
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  return res.redirect("/admin");
});

app.post("/admin/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME);
  return res.redirect("/admin");
});

app.get("/admin/export.csv", requireAdmin, (_req, res) => {
  const signups = listSignups(db);
  const lines = ["email,created_at"];
  for (const row of signups) {
    const email = `"${String(row.email).replaceAll('"', '""')}"`;
    lines.push(`${email},${row.created_at}`);
  }
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    'attachment; filename="waitlist-signups.csv"'
  );
  res.send(lines.join("\n"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Waitlist listening on ${PORT}`);
  console.log(`Data directory: ${DATA_DIR}`);
  console.log(`Admin: /admin`);
});
