import jwt from "jsonwebtoken";

function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export function requireAuth(req, res, next) {
  try {
    const raw = String(req.headers?.authorization || "").trim();
    const token = raw.toLowerCase().startsWith("bearer ")
      ? raw.slice(7).trim()
      : null;
    if (!token) throw httpError(401, "Missing auth token");

    const secret = String(process.env.JWT_SECRET || "").trim();
    if (!secret) throw httpError(500, "Auth not configured");

    const decoded = jwt.verify(token, secret);
    if (!decoded?.email) throw httpError(401, "Invalid token");

    req.user = {
      email: String(decoded.email).trim().toLowerCase(),
      name: decoded.name ? String(decoded.name) : undefined,
      sub: decoded.sub ? String(decoded.sub) : undefined,
    };
    next();
  } catch (err) {
    const status =
      err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError"
        ? 401
        : err?.status;
    if (status) {
      err.status = status;
      err.message = status === 401 ? "Unauthorized" : err.message;
    }
    next(err);
  }
}
