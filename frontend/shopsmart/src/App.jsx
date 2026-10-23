import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useSearchParams,
  useNavigate,
} from "react-router-dom";

import Header from "./components/Header";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Cart from "./pages/Cart";

import "./App.css";

const API_URL = "http://localhost:8000/api";

function getCartSession() {
  let sessionId = localStorage.getItem("shopsmart_cart_session");

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("shopsmart_cart_session", sessionId);
  }

  return sessionId;
}

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingProductId, setAddingProductId] = useState(null);
  const [cartMessage, setCartMessage] = useState("");

  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  // Fetch products from the backend.
  useEffect(() => {
    let cancelled = false;

    async function fetchProducts() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`${API_URL}/products`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load products.");
        }

        if (!cancelled) {
          setProducts(Array.isArray(result.data) ? result.data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              "Unable to load products. Make sure the backend is running."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      cancelled = true;
    };
  }, []);

  // Case-insensitive partial search.
  const normalizedSearch = search.trim().toLowerCase();

  const filteredProducts = products.filter((product) => {
    const name = String(product.name || "").toLowerCase();
    const description = String(product.description || "").toLowerCase();
    const category = String(product.category || "").toLowerCase();

    return (
      !normalizedSearch ||
      name.includes(normalizedSearch) ||
      description.includes(normalizedSearch) ||
      category.includes(normalizedSearch)
    );
  });

  // Add a product to the backend cart.
  async function addToCart(product) {
    if (addingProductId) return;

    setAddingProductId(product._id);
    setCartMessage("");
    setError("");

    try {
      const sessionId = getCartSession();

      const response = await fetch(`${API_URL}/cart/items`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-cart-session": sessionId,
        },
        body: JSON.stringify({
          productId: product._id,
          quantity: 1,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || result.success !== true) {
        throw new Error(
          result.message || `Unable to add ${product.name} to your cart.`
        );
      }

      setCartMessage(`${product.name} added to your cart!`);
    } catch (err) {
      console.error("Add to cart failed:", err);

      setCartMessage(
        err.message ||
          "Unable to add the product. Check that the backend is running."
      );
    } finally {
      setAddingProductId(null);
    }
  }

  return (
    <div className="app">
      <main>
        {/* Hero */}
        <section className="hero">
          <div className="hero-content">
            <span className="hero-label">
              SMARTER SHOPPING STARTS HERE
            </span>

            <h1>
              Find your next
              <br />
              favorite thing.
            </h1>

            <p>
              Discover everyday essentials and tech favorites at great prices.
            </p>

            <a href="#products" className="primary-button">
              Explore products →
            </a>
          </div>

          <div className="hero-decoration">
            <div className="hero-circle">
              <span>✦</span>
              <strong>SHOP</strong>
              <strong>SMART</strong>
            </div>
          </div>
        </section>

        {/* Product catalog */}
        <section className="catalog" id="products">
          <div className="section-heading">
            <div>
              <span className="section-label">HANDPICKED FOR YOU</span>

              <h2>
                {normalizedSearch
                  ? `Search results for "${search.trim()}"`
                  : "Explore our collection"}
              </h2>
            </div>

            <span className="product-count">
              {loading
                ? "Loading..."
                : `${filteredProducts.length} ${
                    filteredProducts.length === 1 ? "product" : "products"
                  }`}
            </span>
          </div>

          {cartMessage && (
            <div className="cart-feedback" role="status">
              {cartMessage}

              <Link to="/cart"> View cart →</Link>
            </div>
          )}

          {loading && <p className="status">Loading products...</p>}

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}

          {!loading && !error && filteredProducts.length === 0 && (
            <div className="status">
              <h3>No matching products found.</h3>
              <p>Try another product name, description, or category.</p>

              <Link to="/" className="primary-button">
                View all products
              </Link>
            </div>
          )}

          {!loading && !error && filteredProducts.length > 0 && (
            <div className="product-grid">
              {filteredProducts.map((product) => (
                <article className="product-card" key={product._id}>
                  <div className="product-image">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        loading="lazy"
                      />
                    ) : (
                      <span className="image-placeholder">
                        Image unavailable
                      </span>
                    )}

                    <span className="category-badge">
                      {product.category}
                    </span>
                  </div>

                  <div className="product-info">
                    <h3>{product.name}</h3>

                    <p className="product-description">
                      {product.description}
                    </p>

                    <div className="product-footer">
                      <div>
                        <span className="price">
                          ₹{Number(product.price).toLocaleString("en-IN")}
                        </span>

                        <p className="stock">
                          {product.stock > 0
                            ? `${product.stock} available`
                            : "Out of stock"}
                        </p>
                      </div>

                      <button
                        className="add-button"
                        type="button"
                        disabled={
                          product.stock <= 0 ||
                          addingProductId !== null
                        }
                        onClick={() => addToCart(product)}
                      >
                        {addingProductId === product._id
                          ? "Adding..."
                          : product.stock <= 0
                            ? "Sold out"
                            : "Add +"}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Coupon promotion */}
        <section className="coupon-banner">
          <div>
            <span className="section-label">A LITTLE EXTRA SAVING</span>
            <h2>Good deals. Better choices.</h2>
            <p>
              Enjoy a discount on eligible orders with our special coupon.
            </p>
          </div>

          <div className="coupon-code">SAVE10</div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <Link to="/" className="logo">
          Shop<span>Smart</span>
        </Link>

        <p>Smarter choices. Better shopping.</p>

        <span>© 2026 ShopSmart</span>
      </footer>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;