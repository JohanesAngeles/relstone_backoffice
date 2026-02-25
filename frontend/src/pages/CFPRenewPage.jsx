import { useEffect, useState } from 'react';
import {
  FaCheckSquare,
  FaShieldAlt,
  FaLayerGroup,
  FaClock,
  FaMedal,
  FaHeadset,
  FaChevronDown,
  FaChevronUp,
  FaBook,
  FaHashtag,
  FaTag,
  FaShoppingCart,
  FaCheckCircle,
} from 'react-icons/fa';
import { getCFPData } from '../services/cfpService';
import useCart from '../context/useCart';
import '../styles/pages/CFPRenewPage.css';

// ── Why Choose cards ────────────────────────────────────────────────────────
const WHY_CARDS = [
  { renderIcon: () => <FaCheckSquare />, title: 'Fully Approved', desc: 'All courses approved for CFP® certification renewal. Registered with CFP® Board as Sponsor #91.' },
  { renderIcon: () => <FaLayerGroup />, title: 'Triple Duty Credits', desc: 'Use the same courses to renew your CFP® certificate, insurance license, and in many states, your CPA license.' },
  { renderIcon: () => <FaClock />, title: 'Your Pace, Your Way', desc: 'Complete courses online or with printed books delivered to you. Finish as fast as you wish with no time pressure.' },
  { renderIcon: () => <FaMedal />, title: 'Proven Track Record', desc: 'Over 4 million courses completed across the U.S. since 1974. Trusted by professionals nationwide.' },
  { renderIcon: () => <FaShieldAlt />, title: 'Risk-Free Guarantee', desc: "30-day money-back guarantee. If you're not satisfied, we'll refund your investment completely." },
  { renderIcon: () => <FaHeadset />, title: '5-Star Customer Service', desc: 'Real experts averaging 20+ years of CE experience, available 7 days a week to help you.' },
];

const STATS = [
  { value: '30',  label: 'Course Hours' },
  { value: '4M+', label: 'Courses Completed' },
  { value: '50+', label: 'Years Experience' },
  { value: '#91', label: 'CFP® Board Sponsor' },
];

// ── Requirements Row ─────────────────────────────────────────────────────────
const RequirementRow = ({ label, value }) => {
  if (!value || value === 'N/A') return null;
  return (
    <div className="cfp-req__row">
      <span className="cfp-req__label">{label}</span>
      <span className="cfp-req__value">{value}</span>
    </div>
  );
};

// ── Course Card ─────────────────────────────────────────────────────────────
const CourseCard = ({ course, addToCart, removeFromCart, isInCart }) => {
  const [showTextbook, setShowTextbook] = useState(false);
  const inCart = isInCart(course._id);

  const handleCart = () => {
    if (inCart) {
      removeFromCart(course._id);
    } else {
      addToCart({
        id:            course._id,
        type:          'course',
        name:          course.name,
        stateSlug:     'cfp-renewal',
        stateName:     'CFP Renewal',
        price:         course.price,
        creditHours:   course.creditHours,
        withTextbook:  showTextbook && course.hasPrintedTextbook,
        textbookPrice: course.printedTextbookPrice || 0,
      });
    }
  };

  const displayPrice = (course.price + (showTextbook && course.hasPrintedTextbook ? course.printedTextbookPrice : 0)).toFixed(2);

  return (
    <div className="cfp-course-card">
      {course.courseType === 'Ethics' && (
        <span className="cfp-course-card__badge cfp-course-card__badge--ethics">Ethics</span>
      )}
      {course.onlineOnly && (
        <span className="cfp-course-card__badge cfp-course-card__badge--online">Online Only</span>
      )}
      <h3 className="cfp-course-card__name">{course.name}</h3>
      <p className="cfp-course-card__desc">{course.description}</p>

      <div className="cfp-course-card__meta">
        {course.itemNumber && (
          <span className="cfp-course-card__meta-item">
            <FaHashtag /> Item {course.itemNumber}
          </span>
        )}
        <span className="cfp-course-card__meta-item">
          <FaBook /> {course.creditHours} Credit Hours
        </span>
        <span className={`cfp-course-card__meta-item cfp-course-card__type cfp-course-card__type--${course.courseType.toLowerCase()}`}>
          <FaTag /> {course.courseType}
        </span>
      </div>

      {course.hasPrintedTextbook && (
        <label className="cfp-course-card__textbook">
          <input
            type="checkbox"
            checked={showTextbook}
            onChange={() => setShowTextbook(v => !v)}
          />
          <span>Receive Printed Textbooks (+${course.printedTextbookPrice?.toFixed(2)})</span>
        </label>
      )}

      <div className="cfp-course-card__footer">
        <span className="cfp-course-card__price">${displayPrice}</span>
        <button
          className={inCart ? 'cfp-course-card__btn cfp-course-card__btn--added' : 'cfp-course-card__btn'}
          onClick={handleCart}
        >
          {inCart ? <><FaCheckCircle /> Added</> : <><FaShoppingCart /> Add to Cart</>}
        </button>
      </div>
    </div>
  );
};

// ── Package Card ─────────────────────────────────────────────────────────────
const PackageCard = ({ pkg, addToCart, removeFromCart, isInCart }) => {
  const inCart = isInCart(pkg._id);

  const handleCart = () => {
    if (inCart) {
      removeFromCart(pkg._id);
    } else {
      addToCart({
        id:           pkg._id,
        type:         'package',
        name:         pkg.name,
        stateSlug:    'cfp-renewal',
        stateName:    'CFP Renewal',
        price:        pkg.price,
        creditHours:  pkg.totalHours,
        withTextbook: false,
        textbookPrice: 0,
      });
    }
  };

  return (
    <div className="cfp-package-card">
      <div className="cfp-package-card__left">
        <div className="cfp-package-card__top">
          <h3 className="cfp-package-card__name">{pkg.name}</h3>
          <span className="cfp-package-card__hours">{pkg.totalHours} Hours</span>
        </div>
        <p className="cfp-package-card__label">Courses Included:</p>
        <ul className="cfp-package-card__courses">
          {pkg.coursesIncluded.map(c => (
            <li key={c}>
              <span className="cfp-package-card__check"><FaCheckSquare /></span>
              {c}
            </li>
          ))}
        </ul>
      </div>
      <div className="cfp-package-card__right">
        <span className="cfp-package-card__price">${pkg.price.toFixed(2)}</span>
        <button
          className={inCart ? 'cfp-package-card__btn cfp-package-card__btn--added' : 'cfp-package-card__btn'}
          onClick={handleCart}
        >
          {inCart ? <><FaCheckCircle /> Added</> : <><FaShoppingCart /> Add to Cart</>}
        </button>
        <p className="cfp-package-card__note">All prices include CFP reporting fees ($1.25/hr)</p>
      </div>
    </div>
  );
};

// ── Main Page ───────────────────────────────────────────────────────────────
const CFPRenewPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reqOpen, setReqOpen] = useState(false);

  const { addToCart, removeFromCart, isInCart } = useCart();

  useEffect(() => {
    getCFPData()
      .then(setData)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="cfp-loading">
      <div className="cfp-loading__spinner" />
      <p>Loading CFP® Renewal courses...</p>
    </div>
  );

  if (error) return (
    <div className="cfp-error">
      <p>Unable to load CFP® course data. Please try again later.</p>
    </div>
  );

  const { state, courses, packages } = data;

  if (!state) return (
    <div className="cfp-error">
      <p>CFP® course data not found. Please run <code>npm run seed:cfp</code> in your backend to seed the data.</p>
    </div>
  );

  return (
    <div className="cfp-page">

      {/* ── HERO ── */}
      <section className="cfp-hero">
        <div className="cfp-container">
          <p className="cfp-hero__eyebrow">Relstone® · CFP® Board Sponsor #91 · Since 1974</p>
          <h1 className="cfp-hero__title">
            Save Your <span className="cfp-hero__accent">CFP® Certification!</span>
          </h1>
          <p className="cfp-hero__sub">
            Studies show that median revenue of CFP® professionals is significantly higher than
            non-CFP® professionals. Don't let your certification lapse.
          </p>
          <div className="cfp-hero__stats">
            {STATS.map(({ value, label }) => (
              <div key={label} className="cfp-hero__stat">
                <span className="cfp-hero__stat-value">{value}</span>
                <span className="cfp-hero__stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE ── */}
      <section className="cfp-why">
        <div className="cfp-container">
          <h2 className="cfp-section-title">Why Choose RELSTONE®?</h2>
          <p className="cfp-section-sub">
            We know how hard you work to serve your clients, and we're committed to making your
            CFP® certification renewal as easy as possible.
          </p>
          <div className="cfp-why__grid">
            {WHY_CARDS.map(({ renderIcon, title, desc }) => (
              <div key={title} className="cfp-why__card">
                <div className="cfp-why__card-icon">{renderIcon()}</div>
                <h3 className="cfp-why__card-title">{title}</h3>
                <p className="cfp-why__card-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CE REQUIREMENTS ── */}
      <section className="cfp-reqs">
        <div className="cfp-container">
          <div className="cfp-reqs__inner">
            <div className="cfp-reqs__bullets">
              <h2 className="cfp-reqs__title">CFP® CE Hour Requirements</h2>
              <ul className="cfp-reqs__list">
                {state.ceBullets.map(b => (
                  <li key={b}>
                    <span className="cfp-reqs__check"><FaCheckSquare /></span>
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="cfp-reqs__details">
              <button className="cfp-reqs__toggle" onClick={() => setReqOpen(v => !v)}>
                <span>Full Requirements & Notes</span>
                {reqOpen ? <FaChevronUp /> : <FaChevronDown />}
              </button>
              {reqOpen && (
                <div className="cfp-req__table">
                  <RequirementRow label="Total Hours / Period" value={state.requirements.producerHours} />
                  <RequirementRow label="Ethics Requirement" value={state.requirements.producerEthicsHours} />
                  <RequirementRow label="Renewal Deadline" value={state.requirements.renewalDeadline} />
                  <RequirementRow label="Carryover" value={state.requirements.carryOverHours} />
                  {state.requirements.notes?.map((note, i) => (
                    <div key={i} className="cfp-req__note">
                      <FaCheckSquare className="cfp-req__note-icon" />
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── PACKAGES ── */}
      {packages.length > 0 && (
        <section className="cfp-packages">
          <div className="cfp-container">
            <h2 className="cfp-section-title">Complete CE Package</h2>
            <p className="cfp-section-sub">Best value — everything you need to renew in one bundle.</p>
            {packages.map(pkg => (
              <PackageCard
                key={pkg._id}
                pkg={pkg}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
                isInCart={isInCart}
              />
            ))}
          </div>
        </section>
      )}

      {/* ── INDIVIDUAL COURSES ── */}
      <section className="cfp-courses">
        <div className="cfp-container">
          <h2 className="cfp-section-title">Individual CFP® CE Courses</h2>
          <p className="cfp-section-sub">
            Pay only for the hours you need. All prices include the $1.25/hr CFP® reporting fee.
          </p>
          <div className="cfp-courses__grid">
            {courses.map(course => (
              <CourseCard
                key={course._id}
                course={course}
                addToCart={addToCart}
                removeFromCart={removeFromCart}
                isInCart={isInCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="cfp-bottom-cta">
        <div className="cfp-container">
          <div className="cfp-bottom-cta__inner">
            <div>
              <h2 className="cfp-bottom-cta__title">Ready to Renew Your CFP® Certification?</h2>
              <p className="cfp-bottom-cta__sub">
                Join thousands of professionals who trust RELSTONE® for their continuing education.
              </p>
            </div>
            <div className="cfp-bottom-cta__actions">
              <button className="cfp-bottom-cta__btn cfp-bottom-cta__btn--primary">
                Get Started Today
              </button>
              <span className="cfp-bottom-cta__guarantee">
                <FaShieldAlt /> 30-Day Money-Back Guarantee
              </span>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default CFPRenewPage;