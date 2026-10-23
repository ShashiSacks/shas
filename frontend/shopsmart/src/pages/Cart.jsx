import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Cart.css";

const API_URL = "http://localhost:8000/api";

function getCartSession() {
  let sessionId = localStorage.getItem("shopsmart_cart_session");

  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("shopsmart_cart_session", sessionId);
  }

  return sessionId;
}

function Cart() {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingProduct, setUpdatingProduct] = useState(null);

  const sessionId = getCartSession();

  const fetchCart = useCallback(async () => {
    try {
      setError("");

      const response = await fetch(`${API_URL}/cart`, {
        headers: {
          "x-cart-session": sessionId,
        },
      });

      const result = await response.json();

      if (!response.ok || result.success !== true) {
        throw new Error(result.message || "Unable to load your cart.");
      }

      setCart(result.data);
    } catch (err) {
      console.error("Fetch cart error:", err);
      setError(err.message || "Unable to load your cart.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  async function updateQuantity(productId, quantity) {
    if (updatingProduct) return;

    setUpdatingProduct(productId);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/cart/items/${productId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "x-cart-session": sessionId,
          },
          body: JSON.stringify({ quantity }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.success !== true) {
        throw new Error(result.message || "Unable to update quantity.");
      }

      await fetchCart();
    } catch (err) {
      setError(err.message || "Unable to update quantity.");
    } finally {
      setUpdatingProduct(null);
    }
  }

  async function removeItem(productId) {
    if (updatingProduct) return;

    setUpdatingProduct(productId);
    setError("");

    try {
      const response = await fetch(
        `${API_URL}/cart/items/${productId}`,
        {
          method: "DELETE",
          headers: {
            "x-cart-session": sessionId,
          },
        }
      );

      const result = await response.json();

      if (!response.ok || result.success !== true) {
        throw new Error(result.message || "Unable to remove product.");
      }

      await fetchCart();
    } catch (err) {
      setError(err.message || "Unable to remove product.");
    } finally {
      setUpdatingProduct(null);
    }
  }

  if (loading) {
    return (
      <main className="cart-page">
        <h1>Shopping Cart</h1>
        <p>Loading your cart...</p>
      </main>
    );
  }

  if (error && !cart) {
    return (
      <main className="cart-page">
        <h1>Shopping Cart</h1>
        <p className="cart-error">{error}</p>

        <button
          className="cart-primary-button"
          type="button"
          onClick={() => {
            setLoading(true);
            fetchCart();
          }}
        >
          Try Again
        </button>
      </main>
    );
  }

  // Support common cart response structures.
  const items = Array.isArray(cart)
    ? cart
    : Array.isArray(cart?.items)
      ? cart.items
      : [];

  const total = items.reduce((sum, item) => {
    const product = item.product || item.productId || item;
    const price = Number(product.price ?? item.price ?? 0);

    return sum + price * Number(item.quantity || 1);
  }, 0);

  return (
    <main className="cart-page">
      <div className="cart-heading">
        <div>
          <span className="section-label">YOUR SHOPPING BAG</span>
          <h1>Shopping Cart</h1>
          <p>
            {items.length} {items.length === 1 ? "item" : "items"} in your cart
          </p>
        </div>

        <Link to="/" className="continue-shopping">
          ← Continue Shopping
        </Link>
      </div>

      {error && <p className="cart-error">{error}</p>}

      {items.length === 0 ? (
        <section className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add products to see them here.</p>

          <Link to="/" className="cart-primary-button">
            Explore Products
          </Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-items">
            {items.map((item) => {
              const product = item.product || item.productId || item;
              const productId =
                typeof item.productId === "string"
                  ? item.productId
                  : product._id || item._id;

              const price = Number(product.price ?? item.price ?? 0);
              const quantity = Number(item.quantity || 1);

              return (
                <article className="cart-item" key={productId}>
                  <div className="cart-item-image">
                    {product.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <span>🛍️</span>
                    )}
                  </div>

                  <div className="cart-item-details">
                    <h3>{product.name || item.name || "Product"}</h3>

                    <p className="cart-item-price">
                      ₹{price.toLocaleString("en-IN")}
                    </p>

                    <div className="quantity-control">
                      <button
                        type="button"
                        disabled={updatingProduct === productId}
                        onClick={() =>
                          quantity > 1
                            ? updateQuantity(productId, quantity - 1)
                            : removeItem(productId)
                        }
                      >
                        −
                      </button>

                      <span>{quantity}</span>

                      <button
                        type="button"
                        disabled={updatingProduct === productId}
                        onClick={() =>
                          updateQuantity(productId, quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="remove-item"
                      type="button"
                      disabled={updatingProduct === productId}
                      onClick={() => removeItem(productId)}
                    >
                      Remove
                    </button>
                  </div>

                  <strong className="cart-line-total">
                    ₹{(price * quantity).toLocaleString("en-IN")}
                  </strong>
                </article>
              );
            })}
          </section>

          <aside className="cart-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{total.toLocaleString("en-IN")}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>

            <div className="summary-total">
              <span>Total</span>
              <strong>₹{total.toLocaleString("en-IN")}</strong>
            </div>

            <button
              type="button"
              className="cart-primary-button checkout-button"
              onClick={() => {
                alert("Checkout integration is the next step.");
              }}
            >
              Proceed to Checkout
            </button>
          </aside>
        </div>
      )}
    </main>
  );
}

export default Cart;