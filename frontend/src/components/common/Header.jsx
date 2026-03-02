// Header.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef, useEffect, useMemo } from 'react';
import {
  FaSearch,
  FaShoppingCart,
  FaChevronDown,
  FaSignOutAlt,
  FaTag,
  FaTimes,
} from 'react-icons/fa';
import logo from '../../assets/images/Left Side Logo.png';
import AuthModal from './AuthModal';
import useCart from '../../context/useCart';
import '../../styles/components/Header.css';

const INSURANCE_STATES = [
  'Alabama', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana',
  'Maine', 'Maryland', 'Michigan', 'Mississippi', 'Missouri', 'Nebraska',
  'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York',
  'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon',
  'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota',
  'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington',
  'West Virginia', 'Wisconsin', 'Wyoming',
];

const NAV_ITEMS = [
  { label: 'States', to: '/insurance', isStatesNav: true },
  {
    label: 'California Real Estate',
    to: '/real-estate',
    dropdown: [
      { label: 'Real Estate Sales License', to: '/real-estate/sales-license' },
      { label: 'Real Estate Broker License', to: '/real-estate/broker-license' },
      { label: 'Renew Your License', to: '/real-estate/renew' },
      { label: 'Continuing Education General Information', to: '/real-estate/continuing-education' },
      { label: 'Final Exams and Certificates', to: '/real-estate/exams-certificates' },
      { label: 'Real Estate FAQ', to: '/real-estate/faq' },
    ],
  },
  { label: 'Exam Prep', to: '/exam-prep' },
  {
    label: 'Insurance CE',
    to: '/insurance',
    dropdown: [
      { label: 'Renew Your Insurance License', to: '/insurance/renew' },
      { label: 'Insurance Continuing Education Courses FAQ', to: '/insurance/faq' },
    ],
  },
  { label: 'CFP Renewal', to: '/cfp-renewal' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact Us', to: '/contact' },
];

/* Helpers */
const slugify = (text) => text.toLowerCase().trim().replace(/\s+/g, '-');

const highlightText = (text, q) => {
  if (!q) return text;
  const lower = text.toLowerCase();
  const query = q.toLowerCase();
  const idx = lower.indexOf(query);
  if (idx === -1) return text;
  const a = text.slice(0, idx);
  const b = text.slice(idx, idx + q.length);
  const c = text.slice(idx + q.length);
  return (
    <>
      {a}
      <mark className="site-header__search-mark">{b}</mark>
      {c}
    </>
  );
};

/* Build a simple “courses” list from nav dropdown items (replace with real API later) */
const COURSE_INDEX = (() => {
  const items = [];
  const push = (label, to) => items.push({ id: `${to}-${label}`, name: label, to });

  NAV_ITEMS.forEach((item) => {
    if (item.dropdown?.length) {
      item.dropdown.forEach((sub) => push(sub.label, sub.to));
    } else if (!item.isStatesNav) {
      push(item.label, item.to);
    }
  });

  // Remove duplicates by `to`
  const uniq = new Map();
  items.forEach((x) => {
    if (!uniq.has(x.to)) uniq.set(x.to, x);
  });
  return Array.from(uniq.values());
})();

/* ── States full-width dropdown ── */
const StatesDropdown = () => (
  <div className="site-header__dropdown site-header__dropdown--states">
    <p className="site-header__states-label">Select a State</p>
    <div className="site-header__states-grid">
      {INSURANCE_STATES.map((state) => (
        <Link key={state} to={`/insurance/${slugify(state)}`} className="site-header__state-pill">
          {state}
        </Link>
      ))}
    </div>
  </div>
);

/* ── Regular dropdown ── */
const DropdownMenu = ({ items }) => (
  <div className="site-header__dropdown">
    {items.map((item) => (
      <Link key={item.to} to={item.to} className="site-header__dropdown-item">
        {item.label}
      </Link>
    ))}
  </div>
);

/* ── Nav item ── */
const NavItem = ({ item }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  if (item.isStatesNav) {
    return (
      <div
        ref={ref}
        className={`site-header__nav-item site-header__nav-item--has-dropdown${
          open ? ' site-header__nav-item--open' : ''
        }`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <button
          type="button"
          className="site-header__nav-link site-header__nav-link--dropdown-trigger"
          onClick={() => setOpen((v) => !v)}
        >
          States
          <FaChevronDown
            className={`site-header__chevron${open ? ' site-header__chevron--open' : ''}`}
          />
        </button>
        {open && <StatesDropdown />}
      </div>
    );
  }

  if (!item.dropdown) {
    return (
      <Link to={item.to} className="site-header__nav-link">
        {item.label}
      </Link>
    );
  }

  return (
    <div
      ref={ref}
      className={`site-header__nav-item site-header__nav-item--has-dropdown${
        open ? ' site-header__nav-item--open' : ''
      }`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="site-header__nav-link site-header__nav-link--dropdown-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {item.label}
        <FaChevronDown
          className={`site-header__chevron${open ? ' site-header__chevron--open' : ''}`}
        />
      </button>
      {open && <DropdownMenu items={item.dropdown} />}
    </div>
  );
};

/* ── User avatar with dropdown ── */
const UserAvatar = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const initials = (user?.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="site-header__user-wrap">
      <button
        type="button"
        className="site-header__avatar"
        onClick={() => setOpen((v) => !v)}
        aria-label="User menu"
      >
        {initials}
      </button>

      {open && (
        <div className="site-header__user-dropdown">
          <div className="site-header__user-info">
            <span className="site-header__user-name">{user.name}</span>
            <span className="site-header__user-email">{user.email}</span>
          </div>
          <div className="site-header__user-divider" />
          <Link to="/profile" className="site-header__user-item" onClick={() => setOpen(false)}>
            My Profile
          </Link>
          <Link to="/my-courses" className="site-header__user-item" onClick={() => setOpen(false)}>
            My Courses
          </Link>
          <div className="site-header__user-divider" />
          <button
            type="button"
            className="site-header__user-item site-header__user-logout"
            onClick={onLogout}
          >
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Cart Icon with hover preview dropdown ── */
const CartIcon = () => {
  const { cartItems, cartTotal, cartCount, removeFromCart } = useCart();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const leaveTimer = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(leaveTimer.current);
    setOpen(true);
  };

  const handleMouseLeave = () => {
    leaveTimer.current = setTimeout(() => setOpen(false), 150);
  };

  return (
    <div
      ref={ref}
      className="site-header__cart-wrap"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link to="/cart" className="site-header__action-btn site-header__cart">
        <FaShoppingCart />
        {cartCount > 0 && <span className="site-header__cart-badge">{cartCount}</span>}
      </Link>

      {open && (
        <div className="cart-preview">
          <div className="cart-preview__caret" />

          <div className="cart-preview__head">
            <span className="cart-preview__title">Your Cart</span>
            {cartCount > 0 && (
              <span className="cart-preview__badge">
                {cartCount} item{cartCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {cartItems.length === 0 ? (
            <div className="cart-preview__empty">
              <FaShoppingCart className="cart-preview__empty-icon" />
              <p className="cart-preview__empty-text">Your cart is empty</p>
              <Link to="/insurance/renew" className="cart-preview__browse-btn">
                Browse Courses
              </Link>
            </div>
          ) : (
            <>
              <div className="cart-preview__items">
                {cartItems.map((item) => {
                  const lineTotal =
                    item.price + (item.withTextbook ? item.textbookPrice || 0 : 0);
                  return (
                    <div key={item.id} className="cart-preview__item">
                      <div className="cart-preview__item-info">
                        <span
                          className={`cart-preview__item-badge cart-preview__item-badge--${item.type}`}
                        >
                          {item.type === 'package' ? 'Package' : 'Course'}
                        </span>
                        <span className="cart-preview__item-name" title={item.name}>
                          {item.name}
                        </span>
                        {item.creditHours > 0 && (
                          <span className="cart-preview__item-hours">
                            <FaTag /> {item.creditHours} hrs
                          </span>
                        )}
                        {item.withTextbook && (
                          <span className="cart-preview__item-textbook">+ Printed Textbook</span>
                        )}
                      </div>
                      <div className="cart-preview__item-right">
                        <span className="cart-preview__item-price">${lineTotal.toFixed(2)}</span>
                        <button
                          type="button"
                          className="cart-preview__item-remove"
                          onClick={(e) => {
                            e.preventDefault();
                            removeFromCart(item.id);
                          }}
                          aria-label={`Remove ${item.name}`}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="cart-preview__footer">
                <div className="cart-preview__total">
                  <span>Total</span>
                  <strong>${cartTotal.toFixed(2)}</strong>
                </div>
                <div className="cart-preview__actions">
                  <Link to="/cart" className="cart-preview__btn cart-preview__btn--ghost">
                    View Cart
                  </Link>
                  <Link to="/checkout" className="cart-preview__btn cart-preview__btn--solid">
                    Checkout
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

/* ── Header ── */
const Header = () => {
  const navigate = useNavigate();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  const [mobileOpenItem, setMobileOpenItem] = useState(null);
  const [mobileStatesOpen, setMobileStatesOpen] = useState(false);

  const [showAuthModal, setShowAuthModal] = useState(false);

  // IMPORTANT: AuthModal screens are "login" and "register" (NOT "signup")
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'

  const [user, setUser] = useState(null);

  const searchRef = useRef(null);

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => setUser(null);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const q = searchQuery.trim();

  const { matchedStates, matchedCourses } = useMemo(() => {
    if (!q) return { matchedStates: [], matchedCourses: [] };
    const qq = q.toLowerCase();

    const ms = INSURANCE_STATES.filter((s) => s.toLowerCase().includes(qq)).slice(0, 10);
    const mc = COURSE_INDEX.filter((c) => c.name.toLowerCase().includes(qq)).slice(0, 10);

    return { matchedStates: ms, matchedCourses: mc };
  }, [q]);

  const hasResults = matchedStates.length > 0 || matchedCourses.length > 0;

  const goToState = (state) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    navigate(`/insurance/${slugify(state)}`);
  };

  const goToCourse = (course) => {
    setShowSearchDropdown(false);
    setSearchQuery('');
    navigate(course.to);
  };

  return (
    <>
      <header className="site-header">
        <div className="site-header__top">
          <div className="site-header__container">
            <div className="site-header__top-content">
              <Link to="/" className="site-header__logo">
                <img src={logo} alt="Relstone Logo" className="site-header__logo-image" />
              </Link>

              {/* Search states + courses */}
              <div className="site-header__search" ref={searchRef}>
                <FaSearch className="site-header__search-icon" />
                <input
                  type="text"
                  placeholder="Search states or courses..."
                  className="site-header__search-input"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                />

                {showSearchDropdown && q && (
                  <div className="site-header__search-dropdown" role="listbox">
                    {!hasResults && (
                      <div className="site-header__search-empty">No results for “{q}”</div>
                    )}

                    {matchedStates.length > 0 && (
                      <div className="site-header__search-section">
                        <div className="site-header__search-section-title">States</div>
                        {matchedStates.map((state) => (
                          <button
                            key={state}
                            type="button"
                            className="site-header__search-item"
                            onClick={() => goToState(state)}
                          >
                            {highlightText(state, q)}
                          </button>
                        ))}
                      </div>
                    )}

                    {matchedCourses.length > 0 && (
                      <div className="site-header__search-section">
                        <div className="site-header__search-section-title">Courses</div>
                        {matchedCourses.map((course) => (
                          <button
                            key={course.id}
                            type="button"
                            className="site-header__search-item"
                            onClick={() => goToCourse(course)}
                          >
                            {highlightText(course.name, q)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="site-header__actions">
                <span className="site-header__language">🇺🇸 USD</span>

                <CartIcon />

                {user ? (
                  <UserAvatar user={user} onLogout={handleLogout} />
                ) : (
                  <>
                    <button
                      className="site-header__auth-btn site-header__auth-btn--ghost"
                      onClick={() => {
                        setAuthMode('login');
                        setShowAuthModal(true);
                      }}
                    >
                      Log In
                    </button>
                    <button
                      className="site-header__auth-btn site-header__auth-btn--solid"
                      onClick={() => {
                        setAuthMode('register');
                        setShowAuthModal(true);
                      }}
                    >
                      Sign Up
                    </button>
                  </>
                )}
              </div>

              <button
                className="site-header__mobile-btn"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        <div className="site-header__bottom">
          <div className="site-header__container">
            <nav className="site-header__nav" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => (
                <NavItem key={item.label} item={item} />
              ))}
            </nav>
          </div>
        </div>

        {isMenuOpen && (
          <div className="site-header__mobile-menu">
            <div className="site-header__container">
              <nav className="site-header__nav-mobile">
                {NAV_ITEMS.map((item) => (
                  <div key={item.label}>
                    {item.isStatesNav ? (
                      <>
                        <button
                          type="button"
                          className="site-header__nav-link-mobile site-header__nav-link-mobile--trigger"
                          onClick={() => setMobileStatesOpen((v) => !v)}
                        >
                          States
                          <FaChevronDown
                            className={`site-header__chevron${
                              mobileStatesOpen ? ' site-header__chevron--open' : ''
                            }`}
                          />
                        </button>
                        {mobileStatesOpen && (
                          <div className="site-header__mobile-states">
                            {INSURANCE_STATES.map((state) => (
                              <Link
                                key={state}
                                to={`/insurance/${slugify(state)}`}
                                className="site-header__mobile-state-item"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {state}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : item.dropdown ? (
                      <>
                        <button
                          type="button"
                          className="site-header__nav-link-mobile site-header__nav-link-mobile--trigger"
                          onClick={() =>
                            setMobileOpenItem(mobileOpenItem === item.to ? null : item.to)
                          }
                        >
                          {item.label}
                          <FaChevronDown
                            className={`site-header__chevron${
                              mobileOpenItem === item.to ? ' site-header__chevron--open' : ''
                            }`}
                          />
                        </button>
                        {mobileOpenItem === item.to && (
                          <div className="site-header__mobile-dropdown">
                            {item.dropdown.map((sub) => (
                              <Link
                                key={sub.to}
                                to={sub.to}
                                className="site-header__mobile-dropdown-item"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <Link
                        to={item.to}
                        className="site-header__nav-link-mobile"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}

                {!user ? (
                  <div className="site-header__mobile-auth">
                    <button
                      type="button"
                      className="site-header__auth-btn site-header__auth-btn--ghost site-header__auth-btn--full"
                      onClick={() => {
                        setAuthMode('login');
                        setShowAuthModal(true);
                        setIsMenuOpen(false);
                      }}
                    >
                      Log In
                    </button>
                    <button
                      type="button"
                      className="site-header__auth-btn site-header__auth-btn--solid site-header__auth-btn--full"
                      onClick={() => {
                        setAuthMode('register');
                        setShowAuthModal(true);
                        setIsMenuOpen(false);
                      }}
                    >
                      Sign Up
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="site-header__nav-link-mobile"
                    style={{
                      color: '#ef4444',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      padding: '0.75rem 0',
                      fontWeight: 500,
                    }}
                    onClick={handleLogout}
                  >
                    Sign Out
                  </button>
                )}
              </nav>
            </div>
          </div>
        )}
      </header>

      {showAuthModal && (
        <AuthModal
          mode={authMode} // expects "login" | "register"
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />
      )}
    </>
  );
};

export default Header;