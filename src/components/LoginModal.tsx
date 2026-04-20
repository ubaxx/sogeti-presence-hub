import { useState } from "react";
import {
  loginWithCredentials,
  registerWithCredentials
} from "../features/auth/authService";

type Props = {
  onClose?: () => void;
};

export default function LoginModal({ onClose }: Props) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(): Promise<void> {
    setSubmitting(true);
    setError("");

    const result =
      mode === "login"
        ? await loginWithCredentials(email, password)
        : await registerWithCredentials(name, email, password);

    setSubmitting(false);

    if (!result.success) {
      setError(result.error ?? "Unable to continue.");
      return;
    }

    onClose?.();
    window.location.reload();
  }

  return (
    <div className="presence-modal">
      <div className="presence-modal-card">
        <div className="presence-modal-header">
          <div className="presence-modal-icon">PH</div>

          <div>
            <div className="presence-modal-title">
              {mode === "login" ? "Sign in" : "Create account"}
            </div>
            <div className="presence-modal-subtitle">
              Access Presence Hub with your own company account
            </div>
          </div>
        </div>

        <div className="presence-modal-options">
          <div className="range-toggle auth-mode-toggle" aria-label="Authentication mode">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => {
                setMode("login");
                setError("");
              }}
            >
              Sign in
            </button>
            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => {
                setMode("register");
                setError("");
              }}
            >
              Register
            </button>
          </div>

          {mode === "register" && (
            <label className="admin-filter-field">
              <span>Full name</span>
              <input
                className="admin-select"
                type="text"
                aria-label="Full name"
                placeholder="Enter your name"
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </label>
          )}

          <label className="admin-filter-field">
            <span>Email</span>
            <input
              className="admin-select"
              type="email"
              aria-label="Email"
              placeholder="name@company.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="admin-filter-field">
            <span>Password</span>
            <input
              className="admin-select"
              type="password"
              aria-label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {error && <div className="presence-modal-subtitle">{error}</div>}

          <button className="admin-btn" onClick={() => void handleSubmit()} disabled={submitting}>
            {submitting
              ? "Please wait"
              : mode === "login"
                ? "Continue"
                : "Create account"}
          </button>
        </div>
      </div>
    </div>
  );
}
