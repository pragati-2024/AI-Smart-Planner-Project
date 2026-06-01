import { Router } from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

import { User } from "../models/User.js";

const router = Router();

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function getJwtSecret() {
  const secret = String(process.env.JWT_SECRET || "").trim();
  if (!secret) throw httpError(500, "Auth not configured");
  return secret;
}

function pickUser(doc) {
  return {
    name: doc.name,
    email: doc.email,
  };
}

function signToken(userDoc) {
  const secret = getJwtSecret();
  return jwt.sign(
    {
      sub: String(userDoc._id),
      email: userDoc.email,
      name: userDoc.name,
    },
    secret,
    { expiresIn: "7d" },
  );
}

async function verifyGoogleCredential(credential) {
  const clientId = String(process.env.GOOGLE_CLIENT_ID || "").trim();
  // Treat missing server config as a client-visible error so the UI can show
  // a helpful message (the default error handler hides 5xx messages).
  if (!clientId) throw httpError(400, "Google auth not configured on server");
  if (!credential) throw httpError(400, "Missing credential");

  const client = new OAuth2Client(clientId);
  const ticket = await client.verifyIdToken({
    idToken: String(credential),
    audience: clientId,
  });

  const payload = ticket.getPayload();
  const email = normalizeEmail(payload?.email);
  const name = String(payload?.name || payload?.given_name || "").trim();
  const sub = String(payload?.sub || "").trim();

  if (!email) throw httpError(400, "Google account has no email");
  if (!name) throw httpError(400, "Google account has no name");
  if (!sub) throw httpError(400, "Google account is missing sub");

  return { email, name, sub };
}

// Email signup: create account only.
router.post("/signup", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const name = String(req.body?.name || "").trim();

    if (!name) throw httpError(400, "Missing name");
    if (!email || !email.includes("@")) throw httpError(400, "Invalid email");

    const existing = await User.findOne({ email }).lean();
    if (existing)
      return res.status(409).json({ error: "Account already exists" });

    const created = await User.create({ email, name, provider: "email" });
    res.status(201).json({ user: pickUser(created) });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: "Account already exists" });
    }
    next(err);
  }
});

// Email login: returns JWT.
router.post("/login", async (req, res, next) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!email || !email.includes("@")) throw httpError(400, "Invalid email");

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Account not found" });

    const token = signToken(user);
    res.json({ user: pickUser(user), token });
  } catch (err) {
    next(err);
  }
});

// Google signup: create account only.
router.post("/google/signup", async (req, res, next) => {
  try {
    const { email, name, sub } = await verifyGoogleCredential(
      req.body?.credential,
    );

    const existing = await User.findOne({ email }).lean();
    if (existing)
      return res.status(409).json({ error: "Account already exists" });

    const created = await User.create({
      email,
      name,
      provider: "google",
      googleSub: sub,
    });

    res.status(201).json({ user: pickUser(created) });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({ error: "Account already exists" });
    }
    next(err);
  }
});

// Google login: requires existing account, returns JWT.
router.post("/google/login", async (req, res, next) => {
  try {
    const { email, sub } = await verifyGoogleCredential(req.body?.credential);

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "Account not found" });

    // Keep googleSub in sync if it was missing.
    if (!user.googleSub && sub) {
      user.googleSub = sub;
      user.provider = user.provider || "google";
      await user.save();
    }

    const token = signToken(user);
    res.json({ user: pickUser(user), token });
  } catch (err) {
    next(err);
  }
});

export default router;
