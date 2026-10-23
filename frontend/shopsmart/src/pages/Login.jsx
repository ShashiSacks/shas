import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (loading) return;

    setError("");
    setLoading(true);

    try {
      const result = await loginUser({
        email: formData.email.trim(),
        password: formData.password,
      });

      if (!result.token || !result.user) {
        throw new Error("The server returned an invalid login response.");
      }

      // Save the authenticated user's details.
      localStorage.setItem("shopsmart_token", result.token);
      localStorage.setItem(
        "shopsmart_user",
        JSON.stringify(result.user)
      );

      // Tell the header that authentication has changed.
      window.dispatchEvent(new Event("shopsmart-auth-change"));

      // Return to the homepage.
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.message || "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Welcome Back!</h1>

        <p className="auth-subtitle">
          Login to continue shopping with ShopSmart.
        </p>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <label htmlFor="login-email">Email Address</label>

        <input
          id="login-email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          maxLength={254}
          required
        />

        <label htmlFor="login-password">Password</label>

        <input
          id="login-password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          autoComplete="current-password"
          required
        />

        <button
          type="submit"
          className="auth-submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p className="auth-footer">
          Don't have an account?{" "}
          <Link to="/signup">Sign Up</Link>
        </p>
      </form>
    </main>
  );
}

export default Login;