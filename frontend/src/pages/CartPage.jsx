import { Link } from 'react-router-dom';
import {
  FaShoppingCart,
  FaTrash,
  FaArrowLeft,
  FaCheckSquare,
  FaTag,
  FaLock,
  FaShieldAlt,
} from 'react-icons/fa';
import useCart from '../context/useCart';
import '../styles/pages/CartPage.css';

// ── Empty state ─────────────────────────────────────────────────────────────
const EmptyCart = () => (
  <div className="cart-empty">
    <div className="cart-empty__icon"><FaShoppingCart /></div>
    <h2 className="cart-empty__title">Your cart is empty</h2>
    <p className="cart-empty__sub">Browse our CE courses and add them to your cart.</p>
    <div className="cart-empty__links">
      <Link to="/insurance/renew" className="cart-empty__btn cart-empty__btn--primary">
        Browse Insurance CE
      </Link>
      <Link to="/cfp-renewal" className="cart-empty__btn cart-empty__btn--ghost">
        Browse CFP® Courses
      </Link>
    </div>
  </div>
);

// ── Cart Item Row ────────────────────────────────────────────────────────────
const CartItem = ({ item, onRemove, onToggleTextbook }) => {
  const lineTotal = item.price + (item.withTextbook ? (item.textbookPrice || 0) : 0);

  return (
    <div className="cart-item">
      {/* Left: info */}
      <div className="cart-item__info">
        <div className="cart-item__meta-row">
          <span className={`cart-item__type-badge cart-item__type-badge--${item.type}`}>
            {item.type === 'package' ? 'Package' : 'Course'}
          </span>
          <span className="cart-item__state">{item.stateName}</span>
        </div>
        <h3 className="cart-item__name">{item.name}</h3>
        {item.creditHours > 0 && (
          <p className="cart-item__hours">
            <FaTag className="cart-item__hours-icon" />
            {item.creditHours} Credit Hours
          </p>
        )}

        {/* Textbook toggle (only for courses that support it) */}
        {item.type === 'course' && item.textbookPrice > 0 && (
          <label className="cart-item__textbook">
            <input
              type="checkbox"
              checked={item.withTextbook}
              onChange={() => onToggleTextbook(item.id)}
            />
            <span>
              Printed Textbook
              <strong className="cart-item__textbook-price">
                {' '}+${item.textbookPrice.toFixed(2)}
              </strong>
            </span>
          </label>
        )}
      </div>

      {/* Right: price + remove */}
      <div className="cart-item__right">
        <span className="cart-item__price">${lineTotal.toFixed(2)}</span>
        <button
          className="cart-item__remove"
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name}`}
          title="Remove from cart"
        >
          <FaTrash />
        </button>
      </div>
    </div>
  );
};

// ── Order Summary ────────────────────────────────────────────────────────────
const OrderSummary = ({ cartItems, cartTotal, totalCreditHours, onClear }) => (
  <div className="cart-summary">
    <h2 className="cart-summary__title">Order Summary</h2>

    {/* Line items */}
    <div className="cart-summary__lines">
      {cartItems.map(item => {
        const lineTotal = item.price + (item.withTextbook ? (item.textbookPrice || 0) : 0);
        return (
          <div key={item.id} className="cart-summary__line">
            <span className="cart-summary__line-name">{item.name}</span>
            <span className="cart-summary__line-price">${lineTotal.toFixed(2)}</span>
          </div>
        );
      })}
    </div>

    <div className="cart-summary__divider" />

    {/* Credit hours */}
    {totalCreditHours > 0 && (
      <div className="cart-summary__hours">
        <FaCheckSquare className="cart-summary__hours-icon" />
        <span>{totalCreditHours} Total Credit Hours</span>
      </div>
    )}

    {/* Total */}
    <div className="cart-summary__total-row">
      <span className="cart-summary__total-label">Total</span>
      <span className="cart-summary__total-value">${cartTotal.toFixed(2)}</span>
    </div>

    {/* Checkout button */}
    <Link to="/checkout" className="cart-summary__checkout-btn">
      <FaLock /> Proceed to Checkout
    </Link>

    {/* Trust badges */}
    <div className="cart-summary__trust">
      <FaShieldAlt className="cart-summary__trust-icon" />
      <span>Secure checkout · 30-day money-back guarantee</span>
    </div>

    {/* Clear cart */}
    <button className="cart-summary__clear" onClick={onClear}>
      Clear Cart
    </button>
  </div>
);

// ── Main Cart Page ───────────────────────────────────────────────────────────
const CartPage = () => {
  const { cartItems, cartTotal, totalCreditHours, removeFromCart, toggleTextbook, clearCart } = useCart();

  return (
    <div className="cart-page">

      {/* Header strip */}
      <div className="cart-page__header">
        <div className="cart-page__container">
          <h1 className="cart-page__title">
            <FaShoppingCart className="cart-page__title-icon" />
            Your Cart
            {cartItems.length > 0 && (
              <span className="cart-page__count">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
            )}
          </h1>
          <Link to="/insurance/renew" className="cart-page__back">
            <FaArrowLeft /> Continue Shopping
          </Link>
        </div>
      </div>

      <div className="cart-page__container">
        {cartItems.length === 0 ? (
          <EmptyCart />
        ) : (
          <div className="cart-page__body">

            {/* ── Items list ── */}
            <div className="cart-page__items">
              <div className="cart-items-header">
                <span>Course / Package</span>
                <span>Price</span>
              </div>
              <div className="cart-items-list">
                {cartItems.map(item => (
                  <CartItem
                    key={item.id}
                    item={item}
                    onRemove={removeFromCart}
                    onToggleTextbook={toggleTextbook}
                  />
                ))}
              </div>
            </div>

            {/* ── Order summary ── */}
            <OrderSummary
              cartItems={cartItems}
              cartTotal={cartTotal}
              totalCreditHours={totalCreditHours}
              onClear={clearCart}
            />

          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;