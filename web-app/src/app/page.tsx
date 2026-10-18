"use client";

import Image from "next/image";
import { useState } from "react";
import styles from "./page.module.css";
import {
  login,
  getMyInfo,
  type AuthServiceError,
  type UserInfo,
} from "@/services";

type FormState = "idle" | "loading" | "error";

// ─── Welcome Screen ───────────────────────────────────────────────────────────

function WelcomeScreen({
  user,
  onSignOut,
}: {
  user: UserInfo;
  onSignOut: () => void;
}) {
  const displayName =
    [user.firstName, user.lastName].filter(Boolean).join(" ") || user.username;
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <main className={styles.welcomePage}>
      <div className={styles.noise} aria-hidden="true" />
      <div className={styles.gridLines} aria-hidden="true" />

      <div className={styles.welcomeCard}>
        {/* Avatar + Greeting */}
        <div className={styles.avatarSection}>
          <div className={styles.avatarRing}>
            <div className={styles.avatarInner}>{initials}</div>
            <div className={styles.onlineBadge} aria-label="Online" />
          </div>
          <div className={styles.greetingSection}>
            <h1 className={styles.greetingTitle}>
              Welcome,{" "}
              <span className={styles.greetingUsername}>{displayName}</span>!
            </h1>
            <p className={styles.greetingSubtitle}>
              You&apos;re successfully authenticated ✓
            </p>
          </div>
        </div>

        <div className={styles.welcomeDivider} aria-hidden="true" />

        {/* Info tiles */}
        <div className={styles.infoGrid}>
          <div className={`${styles.infoTile} ${styles.infoTileFullWidth}`}>
            <div className={styles.infoTileLabel}>Username</div>
            <div className={styles.infoTileValue}>{user.username}</div>
          </div>
          <div className={styles.infoTile}>
            <div className={styles.infoTileLabel}>First name</div>
            {user.firstName ? (
              <div className={styles.infoTileValue}>{user.firstName}</div>
            ) : (
              <div className={styles.infoTileValueMuted}>Not set</div>
            )}
          </div>
          <div className={styles.infoTile}>
            <div className={styles.infoTileLabel}>Last name</div>
            {user.lastName ? (
              <div className={styles.infoTileValue}>{user.lastName}</div>
            ) : (
              <div className={styles.infoTileValueMuted}>Not set</div>
            )}
          </div>

        </div>

        {/* Roles */}
        {user.roles.length > 0 && (
          <div className={styles.rolesSection}>
            <div className={styles.rolesSectionLabel}>Roles</div>
            <div className={styles.rolesList}>
              {user.roles.map((role) => (
                <span key={role.name} className={styles.roleBadge}>
                  <span className={styles.roleDot} aria-hidden="true" />
                  {role.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Sign out */}
        <button
          id="sign-out"
          className={styles.signOutButton}
          onClick={onSignOut}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign out
        </button>
      </div>
    </main>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      setErrorMessage("Please enter your username and password.");
      setFormState("error");
      return;
    }

    setFormState("loading");
    setErrorMessage("");

    try {
      // 1. Authenticate → get token
      const { token } = await login({ username, password });
      sessionStorage.setItem("auth_token", token);

      // 2. Fetch user info using the token
      const info = await getMyInfo(token);
      setUserInfo(info);
    } catch (err) {
      const authErr = err as AuthServiceError;
      setErrorMessage(
        authErr.message ?? "An unexpected error occurred. Please try again.",
      );
      setFormState("error");
    }
  };

  const handleSignOut = () => {
    sessionStorage.removeItem("auth_token");
    setUserInfo(null);
    setUsername("");
    setPassword("");
    setFormState("idle");
  };

  // ── Render welcome screen after successful login ──────────────────────────
  if (userInfo) {
    return <WelcomeScreen user={userInfo} onSignOut={handleSignOut} />;
  }

  const isLoading = formState === "loading";

  // ── Render login form ─────────────────────────────────────────────────────
  return (
    <main className={styles.loginPage}>
      {/* Background effects */}
      <div className={styles.noise} aria-hidden="true" />
      <div className={styles.gridLines} aria-hidden="true" />

      {/* Login card */}
      <div className={styles.card}>
        {/* Logo + Brand */}
        <div className={styles.logoWrapper}>
          <div className={styles.logoContainer}>
            <Image
              src="/logo.jpg"
              alt="App Logo"
              width={72}
              height={72}
              className={styles.logoImage}
              priority
            />
          </div>
          <div className={styles.brandText}>
            <h1 className={styles.brandTitle}>Welcome back</h1>
            <p className={styles.brandSubtitle}>
              Sign in to continue to your account
            </p>
          </div>
        </div>

        <div className={styles.divider} aria-hidden="true" />

        {/* Error banner */}
        {formState === "error" && (
          <div className={styles.errorBanner} role="alert">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {errorMessage}
          </div>
        )}

        {/* Login form */}
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          {/* Username field */}
          <div className={styles.fieldGroup}>
            <label htmlFor="username" className={styles.label}>
              Username
            </label>
            <div className={styles.inputWrapper}>
              <svg
                className={styles.inputIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
              <input
                id="username"
                type="text"
                className={`${styles.input} ${formState === "error" ? styles.inputError : ""}`}
                placeholder="your username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setFormState("idle");
                }}
                autoComplete="username"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className={styles.fieldGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.inputWrapper}>
              <svg
                className={styles.inputIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`${styles.input} ${formState === "error" ? styles.inputError : ""}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setFormState("idle");
                }}
                autoComplete="current-password"
                disabled={isLoading}
                required
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isLoading}
              >
                {showPassword ? (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            className={`${styles.submitButton} ${isLoading ? styles.submitButtonLoading : ""}`}
            disabled={isLoading}
          >
            <span className={styles.buttonContent}>
              {isLoading ? (
                <>
                  <span className={styles.spinner} aria-hidden="true" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign in
                  <svg
                    className={styles.buttonArrow}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </span>
          </button>
        </form>
      </div>
    </main>
  );
}
