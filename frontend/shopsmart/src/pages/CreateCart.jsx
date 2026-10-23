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

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load cart.");
      }

      setCart(result.data);
    } catch (err) {
      setError(err.message || "Unable to load your cart.");
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  async function updateQuantity(productId, quantity) {
    if (quantity < 1) {
      return removeItem(productId);
    }

    try {
      setError("");

      const response = await fetch(`${API_URL}/cart/items/${productId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-cart-session": sessionId,
        },
        body: JSON.stringify({ quantity }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to update quantity.");
      }

      await fetchCart();
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeItem(productId) {
    try {
      setError("");

      const response = await fetch(`${API_URL}/cart/items/${productId}`, {
        method: "DELETE",
        headers: {
          "x-cart-session": sessionId,
        },
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to remove item.");
      }

      await fetchCart();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div className="cart-page"><p>Loading your cart...</p></div>;
  }

  if (error && !cart) {
    return (
      <div className="cart-page">
        <p className="cart-error">{error}</p>
        <button onClick={fetchCart}>Try again</button>
      </div>
    );
  }

  const items = cart?.items || [];

  const total = items.reduce((sum, item) => {
    return sum + Number(item.product?.price || item.price || 0) * item.quantity;
  }, 0);

  return (
    <main className="cart-page">
      <div className="cart-heading">
        <div>
          <span className="section-label">YOUR SHOPPING BAG</span>
          <h1>Shopping Cart</h1>
        </div>

        <Link to="/" className="continue-shopping">
          ← Continue shopping
        </Link>
      </div>

      {error && <p className="cart-error">{error}</p>}

      {items.length === 0 ? (
        <section className="empty-cart">
          <div className="empty-cart-icon">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Discover something you'll love.</p>

          <Link to="/" className="cart-primary-button">
            Explore products
          </Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-items">
            {items.map((item) => {
              const product = item.product || {};
              const productId = product._id || item.productId;

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
                      ₹{Number(product.price || item.price || 0).toLocaleString("en-IN")}
                    </p>

                    <div className="quantity-control">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() =>
                          updateQuantity(productId, item.quantity - 1)
                        }
                      >
                        −
                      </button>

                      <span>{item.quantity}</span>

                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() =>
                          updateQuantity(productId, item.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      className="remove-item"
                      onClick={() => removeItem(productId)}
                    >
                      Remove
                    </button>
                  </div>

                  <strong className="cart-line-total">
                    ₹{(
                      Number(product.price || item.price || 0) * item.quantity
                    ).toLocaleString("en-IN")}
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
                window.location.href = "/checkout";
              }}
            >
              Proceed to Checkout
            </button>

            <p className="cart-note">
              Your order total may change when shipping and discounts are applied.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}

export default Cart;