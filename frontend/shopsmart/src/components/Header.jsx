import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

function getSavedUser() {
  try {
    const savedUser = localStorage.getItem("shopsmart_user");
    return savedUser ? JSON.parse(savedUser) : null;
  } catch {
    return null;
  }
}

function Header() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [user, setUser] = useState(getSavedUser);

  const [searchValue, setSearchValue] = useState(
    () => searchParams.get("search") || ""
  );

  // Update search input when the URL query changes.
  useEffect(() => {
    setSearchValue(searchParams.get("search") || "");
  }, [searchParams]);

  // Synchronize the header with login and logout.
  useEffect(() => {
    function updateUser() {
      setUser(getSavedUser());
    }

    window.addEventListener("shopsmart-auth-change", updateUser);
    window.addEventListener("storage", updateUser);

    return () => {
      window.removeEventListener("shopsmart-auth-change", updateUser);
      window.removeEventListener("storage", updateUser);
    };
  }, []);

  // Submit product search.
  function handleSearch(event) {
    event.preventDefault();

    const query = searchValue.trim();

    if (query) {
      navigate(`/?search=${encodeURIComponent(query)}#products`);
    } else {
      navigate("/");
    }
  }

  // Log out the user.
  function handleLogout() {
    localStorage.removeItem("shopsmart_token");
    localStorage.removeItem("shopsmart_user");

    setUser(null);

    window.dispatchEvent(new Event("shopsmart-auth-change"));

    navigate("/", { replace: true });
  }

  return (
    <header className="header">
      {/* Logo */}
      <Link to="/" className="logo" aria-label="ShopSmart home">
        Shop<span>Smart</span>
      </Link>

      {/* Search bar */}
      <form className="search-box" onSubmit={handleSearch}>
        <input
          type="search"
          name="search"
          placeholder="Search products..."
          aria-label="Search products"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
        />

        <button type="submit" className="search-submit">
          Search
        </button>
      </form>

      {/* Navigation */}
      <nav className="header-actions" aria-label="Main navigation">
        {user ? (
          <>
            <span className="header-welcome">
              Hi, {user.name || "Customer"}
            </span>

            <button
              className="cart-button"
              type="button"
              onClick={() => navigate("/cart")}
            >
              🛒 Cart
            </button>

            <button
              className="auth-nav-button login-nav-button"
              type="button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              className="auth-nav-button login-nav-button"
              type="button"
              onClick={() => navigate("/login")}
            >
              Login
            </button>

            <button
              className="auth-nav-button signup-nav-button"
              type="button"
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </button>

            <button
              className="cart-button"
              type="button"
              onClick={() => navigate("/cart")}
            >
              🛒 Cart
            </button>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;