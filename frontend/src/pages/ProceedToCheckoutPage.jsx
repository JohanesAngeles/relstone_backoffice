import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaArrowLeft,
  FaLock,
  FaShieldAlt,
  FaCheckSquare,
  FaTag,
  FaUserCircle,
  FaMapMarkerAlt,
  FaStickyNote,
  FaChevronDown,
  FaChevronUp,
  FaCreditCard,
  FaMapPin,
  FaPhone,
  FaEnvelope,
} from 'react-icons/fa';
import useCart from '../context/useCart';
import '../styles/pages/ProceedToCheckoutPage.css';

// ── US States ────────────────────────────────────────────────────────────────
const US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Delaware','Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa',
  'Kansas','Kentucky','Louisiana','Maine','Maryland','Massachusetts','Michigan',
  'Minnesota','Mississippi','Missouri','Montana','Nebraska','Nevada',
  'New Hampshire','New Jersey','New Mexico','New York','North Carolina',
  'North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania','Rhode Island',
  'South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin','Wyoming',
];

// ── DRE Info Dropdown ────────────────────────────────────────────────────────
const DREInfoBox = () => {
  const [open, setOpen] = useState(false);

  const details = [
    { title: 'Course Format', body: 'Correspondence/Internet instruction combining text materials, mandatory quiz questions, and final examinations for each unit.' },
    { title: '15-Hour Courses', body: 'Minimum 2 days from access to materials. Covers Agency, Ethics, Fair Housing, Trust Fund Accounting, Risk Management.' },
    { title: '45-Hour Courses', body: 'Minimum 2 days (online) or 6 days (printed). Maximum completion: 12 months from enrollment.' },
    { title: 'Mandatory Quizzes', body: 'DRE regulations require quizzes before final exams. Submit online at RELSTONEexams.com for instant feedback.' },
    { title: 'Final Exams', body: 'Standard courses: 15 questions, 15 min. Implicit Bias: 60 questions, 60 min. Consumer Protection: 40 questions, 40 min.' },
    { title: 'Important Regulation', body: 'Do not take more than 15 hours credit of C.E. finals in one 24-hour period per DRE requirements.' },
  ];

  return (
    <div className="co-dre">
      <button className="co-dre__header" onClick={() => setOpen(o => !o)}>
        <div className="co-dre__header-left">
          <div className="co-dre__logo">DRE</div>
          <div>
            <div className="co-dre__name">REAL ESTATE CONTINUING EDUCATION – GENERAL INFORMATION</div>
            <div className="co-dre__sub">California DRE Sponsor No. 1025 | Real Estate License Services – A RELSTONE® Company</div>
          </div>
        </div>
        <span className="co-dre__chevron">{open ? <FaChevronUp /> : <FaChevronDown />}</span>
      </button>

      {open && (
        <div className="co-dre__body">
          <div className="co-dre__grid">
            {details.map((d, i) => (
              <div key={i} className="co-dre__card">
                <p className="co-dre__card-title">● {d.title}</p>
                <p className="co-dre__card-body">{d.body}</p>
              </div>
            ))}
          </div>
          <div className="co-dre__contact">
            <div className="co-dre__contact-item">
              <div className="co-dre__contact-icon co-dre__contact-icon--blue"><FaMapPin /></div>
              <span>P.O. Box 374, Escondido, CA 92033</span>
            </div>
            <div className="co-dre__contact-item">
              <div className="co-dre__contact-icon co-dre__contact-icon--teal"><FaPhone /></div>
              <span>(619) 222-2425</span>
            </div>
            <div className="co-dre__contact-item">
              <div className="co-dre__contact-icon co-dre__contact-icon--navy"><FaEnvelope /></div>
              <span>rels@relstone.com</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Reusable Field ───────────────────────────────────────────────────────────
const Field = ({ label, name, type = 'text', placeholder, value, onChange, error, optional }) => (
  <div className="co-field">
    <label className="co-field__label" htmlFor={name}>
      {label}
      {optional ? <span className="co-field__opt"> (optional)</span> : <span className="co-field__req"> *</span>}
    </label>
    <input
      id={name} name={name} type={type}
      value={value} onChange={onChange} placeholder={placeholder}
      className={`co-field__input${error ? ' co-field__input--err' : ''}`}
    />
    {error && <p className="co-field__error">{error}</p>}
  </div>
);

// ── Order Summary + Credit Card + Place Order (RIGHT SIDEBAR) ────────────────
const CheckoutSummary = ({ cartItems, cartTotal, totalCreditHours, card, onCardChange, cardErrors, onSubmit }) => (
  <aside className="co-summary">

    {/* YOUR ORDER */}
    <div className="co-summary__section">
      <h2 className="co-summary__title">YOUR ORDER</h2>

      <div className="co-summary__header-row">
        <span>PRODUCT</span>
        <span>SUBTOTAL</span>
      </div>

      <div className="co-summary__lines">
        {cartItems.map(item => {
          const lineTotal = item.price + (item.withTextbook ? (item.textbookPrice || 0) : 0);
          return (
            <div key={item.id} className="co-summary__line">
              <div className="co-summary__line-left">
                <span className={`co-summary__badge co-summary__badge--${item.type}`}>
                  {item.type === 'package' ? 'Package' : 'Course'}
                </span>
                <span className="co-summary__line-name">{item.name}</span>
                {item.creditHours > 0 && (
                  <span className="co-summary__line-hours">
                    <FaTag style={{ fontSize: '0.7rem' }} /> {item.creditHours} Credit Hours
                  </span>
                )}
                {item.withTextbook && item.textbookPrice > 0 && (
                  <span className="co-summary__line-textbook">+ Printed Textbook (+${item.textbookPrice.toFixed(2)})</span>
                )}
              </div>
              <span className="co-summary__line-price">${lineTotal.toFixed(2)}</span>
            </div>
          );
        })}
      </div>

      {/* Subtotal / Shipment / Total rows */}
      <div className="co-summary__meta-rows">
        <div className="co-summary__meta-row">
          <span>Subtotal</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
        <div className="co-summary__meta-row">
          <span>Shipment 1</span>
          <span className="co-summary__na">N/A</span>
        </div>
        <div className="co-summary__meta-row co-summary__meta-row--total">
          <span>Total</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
      </div>

      {totalCreditHours > 0 && (
        <div className="co-summary__hours">
          <FaCheckSquare className="co-summary__hours-icon" />
          <span>{totalCreditHours} Total Credit Hours</span>
        </div>
      )}
    </div>

    {/* DRE DROPDOWN */}
    <DREInfoBox />

    {/* CREDIT CARD */}
    <div className="co-summary__section co-summary__section--card">
      <div className="co-card-header-row">
        <span className="co-card-label">Credit Card</span>
        <div className="co-card-logos">
          {/* <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/Visa_Logo.png" alt="Visa" /> */}
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/200px-Mastercard-logo.svg.png" alt="Mastercard" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/American_Express_logo_%282018%29.svg/200px-American_Express_logo_%282018%29.svg.png" alt="Amex" />
          {/* <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/Visa_Electron_logo.svg/200px-Visa_Electron_logo.svg.png" alt="Electron" />
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Maestro_2016.svg/200px-Maestro_2016.svg.png" alt="Maestro" /> */}
        </div>
      </div>
      <p className="co-card-hint">Pay securely using your credit card.</p>

      {/* Card Number */}
      <div className="co-field">
        <label className="co-field__label" htmlFor="cardNumber">
          Card Number <span className="co-field__req">*</span>
        </label>
        <div className="co-card-input-wrap">
          <input
            id="cardNumber" name="cardNumber" type="text"
            placeholder="•••• •••• •••• ••••" maxLength={19}
            value={card.cardNumber} onChange={onCardChange}
            className={`co-field__input co-card-input${cardErrors.cardNumber ? ' co-field__input--err' : ''}`}
          />
          <FaCreditCard className="co-card-input-icon" />
        </div>
        {cardErrors.cardNumber && <p className="co-field__error">{cardErrors.cardNumber}</p>}
      </div>

      {/* Expiry + CVV */}
      <div className="co-row">
        <div className="co-field">
          <label className="co-field__label" htmlFor="expiry">
            Expiration (MM/YY) <span className="co-field__req">*</span>
          </label>
          <input
            id="expiry" name="expiry" type="text"
            placeholder="MM / YY" maxLength={5}
            value={card.expiry} onChange={onCardChange}
            className={`co-field__input${cardErrors.expiry ? ' co-field__input--err' : ''}`}
          />
          {cardErrors.expiry && <p className="co-field__error">{cardErrors.expiry}</p>}
        </div>
        <div className="co-field">
          <label className="co-field__label" htmlFor="cvv">
            Card Security Code <span className="co-field__req">*</span>
          </label>
          <input
            id="cvv" name="cvv" type="text"
            placeholder="CSC" maxLength={4}
            value={card.cvv} onChange={onCardChange}
            className={`co-field__input${cardErrors.cvv ? ' co-field__input--err' : ''}`}
          />
          {cardErrors.cvv && <p className="co-field__error">{cardErrors.cvv}</p>}
        </div>
      </div>

      {/* PLACE ORDER button */}
      <button type="button" onClick={onSubmit} className="co-place-order-btn">
        PLACE ORDER
      </button>

      <p className="co-privacy-note">
        Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our{' '}
        <a href="/privacy" className="co-privacy-link">privacy policy</a>.
      </p>
    </div>

    <div className="co-summary__trust">
      <FaShieldAlt className="co-summary__trust-icon" />
      <span>Secure checkout · 30-day money-back guarantee</span>
    </div>
  </aside>
);

// ── Success screen ───────────────────────────────────────────────────────────
const SuccessScreen = ({ firstName, email, total }) => (
  <div className="co-success">
    <div className="co-success__circle">✓</div>
    <h2 className="co-success__title">Order Confirmed!</h2>
    <p className="co-success__sub">
      Thank you, <strong>{firstName}</strong>! A confirmation has been sent to <strong>{email}</strong>.
    </p>
    <p className="co-success__total">Total charged: <strong>${total.toFixed(2)}</strong></p>
    <Link to="/" className="co-success__home">Back to Home</Link>
  </div>
);

// ── Main Checkout Page ───────────────────────────────────────────────────────
const ProceedToCheckoutPage = () => {
  const { cartItems, cartTotal, totalCreditHours, clearCart } = useCart();

  const [form, setForm] = useState({
    firstName: '', lastName: '', company: '',
    country: 'United States (US)',
    street: '', apt: '', city: '', state: 'California', zip: '',
    phone: '', email: '', password: '', orderNotes: '',
  });
  const [card, setCard] = useState({ cardNumber: '', expiry: '', cvv: '' });
  const [errors, setErrors] = useState({});
  const [cardErrors, setCardErrors] = useState({});
  const [placed, setPlaced] = useState(false);
  const [confirmedTotal, setConfirmedTotal] = useState(0);

  const REQUIRED = ['firstName','lastName','street','city','zip','phone','email','password'];

  function validate() {
    const e = {};
    REQUIRED.forEach(k => { if (!form[k].trim()) e[k] = 'This field is required.'; });
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address.';
    if (form.password && form.password.length < 6) e.password = 'Password must be at least 6 characters.';
    return e;
  }

  function validateCard() {
    const e = {};
    if (!card.cardNumber.replace(/\s/g,'')) e.cardNumber = 'Card number is required.';
    if (!card.expiry.trim()) e.expiry = 'Expiration date is required.';
    if (!card.cvv.trim()) e.cvv = 'Security code is required.';
    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: undefined }));
  }

  function handleCardChange(e) {
    let { name, value } = e.target;
    if (name === 'cardNumber') value = value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim();
    if (name === 'expiry') {
      value = value.replace(/\D/g,'').slice(0,4);
      if (value.length >= 3) value = value.slice(0,2) + '/' + value.slice(2);
    }
    if (name === 'cvv') value = value.replace(/\D/g,'').slice(0,4);
    setCard(c => ({ ...c, [name]: value }));
    if (cardErrors[name]) setCardErrors(ce => ({ ...ce, [name]: undefined }));
  }

  function handleSubmit() {
    const errs = validate();
    const cErrs = validateCard();
    if (Object.keys(errs).length || Object.keys(cErrs).length) {
      setErrors(errs);
      setCardErrors(cErrs);
      // Scroll to first error
      setTimeout(() => {
        const el = document.querySelector('.co-field__input--err');
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }
    setConfirmedTotal(cartTotal);
    clearCart();
    setPlaced(true);
  }

  if (!placed && cartItems.length === 0) {
    return (
      <div className="co-page">
        <div className="co-page__header">
          <div className="co-page__container co-page__header-inner">
            <h1 className="co-page__title"><FaLock className="co-page__title-icon" /> Checkout</h1>
            <Link to="/cart" className="co-page__back"><FaArrowLeft /> Back to Cart</Link>
          </div>
        </div>
        <div className="co-page__container co-empty">
          <p>Your cart is empty. <Link to="/insurance/renew">Browse courses</Link>.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="co-page">
      <div className="co-page__header">
        <div className="co-page__container co-page__header-inner">
          <h1 className="co-page__title"><FaLock className="co-page__title-icon" /> Checkout</h1>
          <Link to="/cart" className="co-page__back"><FaArrowLeft /> Back to Cart</Link>
        </div>
      </div>

      <div className="co-page__container">
        {placed ? (
          <SuccessScreen firstName={form.firstName} email={form.email} total={confirmedTotal} />
        ) : (
          <div className="co-page__body">

            {/* ── LEFT: Billing Form ── */}
            <form className="co-form" onSubmit={e => e.preventDefault()} noValidate>

              <div className="co-section">
                <h2 className="co-section__title"><FaMapMarkerAlt className="co-section__icon" /> Billing &amp; Shipping</h2>
                <div className="co-row">
                  <Field label="First Name" name="firstName" value={form.firstName} onChange={handleChange} error={errors.firstName} />
                  <Field label="Last Name" name="lastName" value={form.lastName} onChange={handleChange} error={errors.lastName} />
                </div>
                <Field label="Company Name" name="company" value={form.company} onChange={handleChange} optional />
                <div className="co-field">
                  <label className="co-field__label" htmlFor="country">Country / Region <span className="co-field__req">*</span></label>
                  <select id="country" name="country" value={form.country} onChange={handleChange} className="co-field__select">
                    <option>United States (US)</option>
                    <option>Canada</option>
                    <option>United Kingdom</option>
                  </select>
                </div>
                <div className="co-field">
                  <label className="co-field__label">Street Address <span className="co-field__req">*</span></label>
                  <input name="street" value={form.street} onChange={handleChange} placeholder="House number and street name"
                    className={`co-field__input co-field__input--mb${errors.street ? ' co-field__input--err' : ''}`} />
                  {errors.street && <p className="co-field__error">{errors.street}</p>}
                  <input name="apt" value={form.apt} onChange={handleChange} placeholder="Apartment, suite, unit, etc. (optional)" className="co-field__input" />
                </div>
                <div className="co-row">
                  <div className="co-field">
                    <label className="co-field__label" htmlFor="city">Town / City <span className="co-field__req">*</span></label>
                    <input id="city" name="city" value={form.city} onChange={handleChange}
                      className={`co-field__input${errors.city ? ' co-field__input--err' : ''}`} />
                    {errors.city && <p className="co-field__error">{errors.city}</p>}
                  </div>
                  <div className="co-field">
                    <label className="co-field__label" htmlFor="state">State <span className="co-field__req">*</span></label>
                    <select id="state" name="state" value={form.state} onChange={handleChange} className="co-field__select">
                      {US_STATES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <Field label="ZIP Code" name="zip" value={form.zip} onChange={handleChange} error={errors.zip} />
                <Field label="Phone" name="phone" type="tel" value={form.phone} onChange={handleChange} error={errors.phone} />
                <Field label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
              </div>

              <div className="co-section">
                <h2 className="co-section__title"><FaUserCircle className="co-section__icon" /> Create Your Account</h2>
                <Field label="Create Account Password" name="password" type="password"
                  placeholder="Minimum 6 characters" value={form.password} onChange={handleChange} error={errors.password} />
                <p className="co-section__hint">Your account gives you instant access to your purchased courses.</p>
              </div>

              <div className="co-section">
                <h2 className="co-section__title"><FaStickyNote className="co-section__icon" /> Additional Information</h2>
                <div className="co-field">
                  <label className="co-field__label">Order Notes <span className="co-field__opt">(optional)</span></label>
                  <textarea name="orderNotes" value={form.orderNotes} onChange={handleChange}
                    placeholder="Notes about your order, e.g. special notes for delivery." rows={4} className="co-field__textarea" />
                </div>
              </div>

            </form>

            {/* ── RIGHT: Order Summary + Card + Place Order ── */}
            <CheckoutSummary
              cartItems={cartItems}
              cartTotal={cartTotal}
              totalCreditHours={totalCreditHours}
              card={card}
              onCardChange={handleCardChange}
              cardErrors={cardErrors}
              onSubmit={handleSubmit}
            />

          </div>
        )}
      </div>
    </div>
  );
};

export default ProceedToCheckoutPage;