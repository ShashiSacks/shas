import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signupUser } from "../services/authService";
import "./Auth.css";

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    const name = formData.name.trim();
    const email = formData.email.trim().toLowerCase();
    const password = formData.password;

    if (name.length < 2 || name.length > 100) {
      setError("Name must be between 2 and 100 characters.");
      return;
    }

    if (password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (password.length > 72) {
      setError("Password must not exceed 72 characters.");
      return;
    }

    if (password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const result = await signupUser({
        name,
        email,
        password,
      });

      if (!result.token || !result.user) {
        throw new Error("The server returned an invalid signup response.");
      }

      // Save the authenticated user's details.
      localStorage.setItem("shopsmart_token", result.token);
      localStorage.setItem(
        "shopsmart_user",
        JSON.stringify(result.user)
      );

      // Update the header immediately.
      window.dispatchEvent(new Event("shopsmart-auth-change"));

      // Return to the homepage.
      navigate("/", { replace: true });
    } catch (err) {
      setError(
        err.message || "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>Create Account</h1>

        <p className="auth-subtitle">
          Join ShopSmart and start shopping.
        </p>

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <label htmlFor="signup-name">Full Name</label>

        <input
          id="signup-name"
          name="name"
          type="text"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={handleChange}
          autoComplete="name"
          minLength={2}
          maxLength={100}
          required
        />

        <label htmlFor="signup-email">Email Address</label>

        <input
          id="signup-email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          autoComplete="email"
          maxLength={254}
          required
        />

        <label htmlFor="signup-password">Password</label>

        <input
          id="signup-password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          value={formData.password}
          onChange={handleChange}
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
        />

        <label htmlFor="signup-confirm-password">
          Confirm Password
        </label>

        <input
          id="signup-confirm-password"
          name="confirmPassword"
          type="password"
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
          required
        />

        <button
          type="submit"
          className="auth-submit"
          disabled={loading}
        >
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">Login</Link>
        </p>
      </form>
    </main>
  );
}

export default Signup;