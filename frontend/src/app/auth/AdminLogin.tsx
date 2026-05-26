import { FormEvent } from "react";
import { useLocation, useNavigate } from "react-router";
import GoogleIcon from "@mui/icons-material/Google";
import GitHubIcon from "@mui/icons-material/GitHub";
import FacebookIcon from "@mui/icons-material/Facebook";
import VisibilityOffOutlinedIcon from "@mui/icons-material/VisibilityOffOutlined";
import "../styles/auth/AdminLogin.css";

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath =
    typeof location.state === "object" &&
    location.state !== null &&
    "from" in location.state &&
    typeof (location.state as { from?: unknown }).from === "string"
      ? (location.state as { from: string }).from
      : "/";

  const handleLogin = () => {
    onLogin();
    navigate(fromPath);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    handleLogin();
  };

  return (
    <div className="admin-login">
      <header className="admin-login__header">
        <h1 className="admin-login__title">Flood Monitoring System</h1>
      </header>

      <main className="admin-login__content">
        <section className="admin-login__card">
          <h2 className="admin-login__card-title">Login</h2>

          <form className="admin-login__form" onSubmit={handleSubmit}>
            <label className="admin-login__label" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              autoComplete="email"
              type="email"
              className="admin-login__input"
              placeholder="username@gmail.com"
              required
            />

            <label className="admin-login__label" htmlFor="password">
              Password
            </label>
            <div className="admin-login__password-wrap">
              <input
                id="password"
                name="password"
                autoComplete="current-password"
                type="password"
                className="admin-login__input admin-login__input--password"
                placeholder="Password"
                required
              />
              <VisibilityOffOutlinedIcon className="admin-login__password-icon" fontSize="small" aria-hidden="true" />
            </div>

            <button type="button" className="admin-login__forgot">
              Forgot Password?
            </button>

            <button type="submit" className="admin-login__submit">
              Sign in
            </button>
          </form>

          <p className="admin-login__divider">or continue with</p>

          <div className="admin-login__socials">
            <button type="button" className="admin-login__social admin-login__social--google" aria-label="Continue with Google">
              <GoogleIcon fontSize="small" />
            </button>
            <button type="button" className="admin-login__social admin-login__social--github" aria-label="Continue with GitHub">
              <GitHubIcon fontSize="small" />
            </button>
            <button type="button" className="admin-login__social admin-login__social--facebook" aria-label="Continue with Facebook">
              <FacebookIcon fontSize="small" />
            </button>
          </div>

          <p className="admin-login__register">
            Don&apos;t have an account yet? <span>Register for free</span>
          </p>
        </section>
      </main>
    </div>
  );
}


