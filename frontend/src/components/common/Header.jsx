import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { FaSearch, FaShoppingCart, FaChevronDown, FaSignOutAlt } from 'react-icons/fa';
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
  'West Virginia', 'Wisconsin', 'Wyoming'
];

const NAV_ITEMS = [
  {
    label: 'States',
    to: '/insurance',
    isStatesNav: true,
  },
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

/* ── States full-width dropdown ── */
const StatesDropdown = () => (
  <div className="site-header__dropdown site-header__dropdown--states">
    <p className="site-header__states-label">Select a State</p>
    <div className="site-header__states-grid">
      {INSURANCE_STATES.map((state) => (
        <Link
          key={state}
          to={`/insurance/${state.toLowerCase().replace(/\s+/g, '-')}`}
          className="site-header__state-pill"
        >
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
        className={`site-header__nav-item site-header__nav-item--has-dropdown${open ? ' site-header__nav-item--open' : ''}`}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
      >
        <button
          className="site-header__nav-link site-header__nav-link--dropdown-trigger"
          onClick={() => setOpen((v) => !v)}
        >
          States
          <FaChevronDown className={`site-header__chevron${open ? ' site-header__chevron--open' : ''}`} />
        </button>
        {open && <StatesDropdown />}
      </div>
    );
  }

  if (!item.dropdown) {
    return <Link to={item.to} className="site-header__nav-link">{item.label}</Link>;
  }

  return (
    <div
      ref={ref}
      className={`site-header__nav-item site-header__nav-item--has-dropdown${open ? ' site-header__nav-item--open' : ''}`}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className="site-header__nav-link site-header__nav-link--dropdown-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {item.label}
        <FaChevronDown className={`site-header__chevron${open ? ' site-header__chevron--open' : ''}`} />
      </button>
      {open && <DropdownMenu items={item.dropdown} />}
    </div>
  );
};

/* ── User avatar with dropdown ── */
const UserAvatar = ({ user, onLogout }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const initials = user.name
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
          <button className="site-header__user-item site-header__user-logout" onClick={onLogout}>
            <FaSignOutAlt /> Sign Out
          </button>
        </div>
      )}
    </div>
  );
};

/* ── Cart Icon (always visible) ── */
const CartIcon = () => {
  const { cartCount } = useCart();
  return (
    <Link to="/cart" className="site-header__action-btn site-header__cart">
      <FaShoppingCart />
      {cartCount > 0 && (
        <span className="site-header__cart-badge">{cartCount}</span>
      )}
    </Link>
  );
};

/* ── Header ── */
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpenItem, setMobileOpenItem] = useState(null);
  const [mobileStatesOpen, setMobileStatesOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => setUser(userData);
  const handleLogout = () => setUser(null);

  return (
    <>
      <header className="site-header">
        {/* Top Bar */}
        <div className="site-header__top">
          <div className="site-header__container">
            <div className="site-header__top-content">
              <Link to="/" className="site-header__logo">
                <img src={logo} alt="Relstone Logo" className="site-header__logo-image" />
              </Link>

              <div className="site-header__search">
                <FaSearch className="site-header__search-icon" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  className="site-header__search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* ── Actions ── */}
              <div className="site-header__actions">
                <span className="site-header__language">🇺🇸 USD</span>

                {/* Cart is always visible */}
                <CartIcon />

                {user ? (
                  <UserAvatar user={user} onLogout={handleLogout} />
                ) : (
                  <>
                    <button
                      className="site-header__auth-btn site-header__auth-btn--ghost"
                      onClick={() => setShowAuthModal(true)}
                    >
                      Log In
                    </button>
                    <button
                      className="site-header__auth-btn site-header__auth-btn--solid"
                      onClick={() => setShowAuthModal(true)}
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

        {/* Bottom Navigation Bar */}
        <div className="site-header__bottom">
          <div className="site-header__container">
            <nav className="site-header__nav" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => (
                <NavItem key={item.label} item={item} />
              ))}
            </nav>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="site-header__mobile-menu">
            <div className="site-header__container">
              <nav className="site-header__nav-mobile">
                {NAV_ITEMS.map((item) => (
                  <div key={item.label}>
                    {item.isStatesNav ? (
                      <>
                        <button
                          className="site-header__nav-link-mobile site-header__nav-link-mobile--trigger"
                          onClick={() => setMobileStatesOpen((v) => !v)}
                        >
                          States
                          <FaChevronDown className={`site-header__chevron${mobileStatesOpen ? ' site-header__chevron--open' : ''}`} />
                        </button>
                        {mobileStatesOpen && (
                          <div className="site-header__mobile-states">
                            {INSURANCE_STATES.map((state) => (
                              <Link
                                key={state}
                                to={`/insurance/${state.toLowerCase().replace(/\s+/g, '-')}`}
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
                          className="site-header__nav-link-mobile site-header__nav-link-mobile--trigger"
                          onClick={() =>
                            setMobileOpenItem(mobileOpenItem === item.to ? null : item.to)
                          }
                        >
                          {item.label}
                          <FaChevronDown
                            className={`site-header__chevron${mobileOpenItem === item.to ? ' site-header__chevron--open' : ''}`}
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

                {/* Mobile auth */}
                {!user ? (
                  <div className="site-header__mobile-auth">
                    <button
                      className="site-header__auth-btn site-header__auth-btn--ghost site-header__auth-btn--full"
                      onClick={() => { setShowAuthModal(true); setIsMenuOpen(false); }}
                    >
                      Log In
                    </button>
                    <button
                      className="site-header__auth-btn site-header__auth-btn--solid site-header__auth-btn--full"
                      onClick={() => { setShowAuthModal(true); setIsMenuOpen(false); }}
                    >
                      Sign Up
                    </button>
                  </div>
                ) : (
                  <button
                    className="site-header__nav-link-mobile"
                    style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', width: '100%', padding: '0.75rem 0', fontWeight: 500 }}
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

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLogin={handleLogin}
        />
      )}
    </>
  );
};

export default Header;