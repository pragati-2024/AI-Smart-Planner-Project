import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  loginWithEmail,
  loginWithGoogle,
  signupWithEmail,
  signupWithGoogle,
} from "../utils/authApi.js";

function decodeJwtPayload(token) {
  try {
    const parts = String(token || "").split(".");
    if (parts.length < 2) return null;

    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function ensureGoogleScriptLoaded() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") return reject(new Error("no-window"));

    if (window.google?.accounts?.id) return resolve();

    const existing = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("load-failed")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("load-failed"));
    document.head.appendChild(script);
  });
}

// Login page.
// Stores a user session in localStorage via App.jsx handlers.
export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isSignup = mode === "signup";

  const googleClientId = useMemo(() => {
    return String(import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
  }, []);

  const googleEnabled = Boolean(googleClientId);

  const handleGoogleCredential = useCallback(
    async (response) => {
      setError("");
      setSuccess("");

      const payload = decodeJwtPayload(response?.credential);
      const nextEmail = String(payload?.email || "").trim();
      const nextName = String(
        payload?.name || payload?.given_name || "",
      ).trim();

      if (!nextEmail) {
        setError("Google sign-in did not return an email.");
        return;
      }

      try {
        if (isSignup) {
          await signupWithGoogle(response?.credential);
          setSuccess("Account created. Please sign in.");
          setMode("login");
          setName("");
          setEmail(nextEmail);
          return;
        }

        const { user, token } = await loginWithGoogle(response?.credential);
        onLogin({ ...user, token });
      } catch (err) {
        setError(err?.message || "Unable to sign in.");
      }
    },
    [isSignup, onLogin],
  );

  useEffect(() => {
    let cancelled = false;
    const containerId = "googleAuthButton";
    const el =
      typeof document !== "undefined"
        ? document.getElementById(containerId)
        : null;
    if (!el) return;

    el.innerHTML = "";
    if (!googleEnabled) return;

    ensureGoogleScriptLoaded()
      .then(() => {
        if (cancelled) return;
        if (!window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredential,
        });

        window.google.accounts.id.renderButton(el, {
          type: "standard",
          theme: "outline",
          size: "large",
          shape: "pill",
          text: isSignup ? "signup_with" : "signin_with",
        });
      })
      .catch(() => {
        if (cancelled) return;
        // If script fails to load, keep it silent and let the user use email flow.
      });

    return () => {
      cancelled = true;
    };
  }, [googleClientId, googleEnabled, handleGoogleCredential, isSignup]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (isSignup) {
      try {
        await signupWithEmail({ name: trimmedName, email: trimmedEmail });
        setSuccess("Account created. Please sign in.");
        setMode("login");
        setName("");
        setEmail(trimmedEmail);
        return;
      } catch (err) {
        setError(err?.message || "Unable to sign up.");
        return;
      }
    }

    try {
      const { user, token } = await loginWithEmail(trimmedEmail);
      onLogin({ ...user, token });
    } catch (err) {
      setError(err?.message || "Unable to sign in.");
    }
  }

  function setModeSafe(nextMode) {
    setError("");
    setSuccess("");
    setMode(nextMode);
  }

  return (
    <div className="loginWrap">
      <div className="loginCard">
        <div className="loginCard__top">
          <div className="loginBadge">AI</div>
          <div>
            <h2 className="loginTitle">
              {isSignup ? "Create account" : "Welcome back"}
            </h2>
            <p className="loginSubtitle">
              {isSignup
                ? "Sign up to start saving tasks per user."
                : "Login to save tasks per user."}
            </p>
          </div>
        </div>

        <div className="loginTabs" role="tablist" aria-label="Authentication">
          <button
            type="button"
            className={isSignup ? "loginTab" : "loginTab loginTab--active"}
            onClick={() => setModeSafe("login")}
            role="tab"
            aria-selected={!isSignup}
          >
            Sign in
          </button>
          <button
            type="button"
            className={isSignup ? "loginTab loginTab--active" : "loginTab"}
            onClick={() => setModeSafe("signup")}
            role="tab"
            aria-selected={isSignup}
          >
            Sign up
          </button>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          {isSignup ? (
            <div className="formRow">
              <label className="label">
                Name
                <input
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., JMD"
                  autoFocus
                />
              </label>
            </div>
          ) : null}

          <div className="formRow">
            <label className="label">
              Email
              <input
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g., you@example.com"
                autoFocus={!isSignup}
              />
            </label>
          </div>

          {success ? <div className="formHint">{success}</div> : null}
          {error ? <div className="formError">{error}</div> : null}

          <div className="loginPrimaryRow">
            <button className="btn btn--primary btn--block" type="submit">
              {isSignup ? "Create account" : "Sign in"}
            </button>
          </div>

          <div className="formHint">Your tasks will sync to the server.</div>

          <div className="loginDivider" aria-hidden="true">
            <span>or</span>
          </div>

          <div className="loginGoogle">
            <div id="googleAuthButton" className="loginGoogle__button" />
            {!googleEnabled ? (
              <button
                className="btn btn--ghost btn--block"
                type="button"
                onClick={() =>
                  setError(
                    "Google auth not configured. Set VITE_GOOGLE_CLIENT_ID in frontend/.env",
                  )
                }
              >
                {isSignup ? "Sign up with Google" : "Sign in with Google"}
              </button>
            ) : null}
          </div>
        </form>
      </div>
    </div>
  );
}
