import { Link } from 'react-router-dom';
import {
  FaBolt,
  FaBullseye,
  FaDollarSign,
  FaTrophy,
  FaHeadset,
  FaRedo,
  FaHome,
  FaStar,
  FaCheckCircle,
  FaChevronRight,
} from 'react-icons/fa';
import '../styles/pages/InsuranceRenewPage.css';

// ── Same state list as Header ──────────────────────────────────────────────
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

// ── Feature cards data ─────────────────────────────────────────────────────
const FEATURES = [
  {
    renderIcon: () => <FaBolt className="renew-feature-card__icon" />,
    title: 'Easy & Fast',
    desc: 'Learn at your own pace online, with optional paperback textbooks, and complete exams with fewer questions.',
  },
  {
    renderIcon: () => <FaBullseye className="renew-feature-card__icon" />,
    title: 'Effective & Proven',
    desc: 'Built on one of the most effective learning formats, trusted by hundreds of thousands of insurance professionals.',
  },
  {
    renderIcon: () => <FaDollarSign className="renew-feature-card__icon" />,
    title: 'Affordable',
    desc: "We'll beat any other school's advertised price, ensuring the best value for your continuing education.",
  },
  {
    renderIcon: () => <FaTrophy className="renew-feature-card__icon" />,
    title: '4,000,000+ Courses Completed',
    desc: 'Professionals across the U.S. have trusted RELSTONE® since 1974 to advance and renew their licenses.',
  },
  {
    renderIcon: () => <FaHeadset className="renew-feature-card__icon" />,
    title: '5-Star Customer Service',
    desc: 'No annoying voicemail. Reach an experienced Insurance CE expert from 6 am to 10 pm PST. Our experts average 21 years of experience.',
  },
];

const PERKS = [
  {
    renderIcon: () => <FaStar className="renew-perk__icon" />,
    text: 'Our customers report: "Your course was easy to complete." "The materials were well organized and well written."',
  },
  {
    renderIcon: () => <FaRedo className="renew-perk__icon" />,
    text: "If you don't pass a final exam for any reason, there's no penalty. You may take the exam again once (for up to one year).",
  },
  {
    renderIcon: () => <FaHome className="renew-perk__icon" />,
    text: 'Finish in one afternoon, if you wish, from the comfort of your own home or office.',
  },
];

// ── Component ──────────────────────────────────────────────────────────────
const InsuranceRenewPage = () => {
  return (
    <div className="renew-page">

      {/* ── HERO ── */}
      <section className="renew-hero">
        <div className="renew-hero__eyebrow">C.E. Credits, Inc. · Overnight Insurance School</div>
        <h1 className="renew-hero__title">
          Insurance Continuing Education<br />
          <span className="renew-hero__title-accent">Online Courses</span>
        </h1>
        <p className="renew-hero__sub">
          State-approved insurance CE courses for 47 states and the District of Columbia —
          trusted by professionals since&nbsp;1974.
        </p>

        {/* ── State selector CTA ── */}
        <div className="renew-hero__cta-row">
          <span className="renew-hero__cta-label">Jump to your state:</span>
          <FaChevronRight className="renew-hero__cta-arrow" />
        </div>
      </section>

      {/* ── STATE GRID ── */}
      <section className="renew-states">
        <div className="renew-container">
          <h2 className="renew-states__heading">Select Your State</h2>
          <div className="renew-states__grid">
            {INSURANCE_STATES.map((state) => (
              <Link
                key={state}
                to={`/insurance/${state.toLowerCase().replace(/\s+/g, '-')}`}
                className="renew-states__pill"
              >
                {state}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY RELSTONE FEATURE CARDS ── */}
      <section className="renew-features">
        <div className="renew-container">
          <div className="renew-features__header">
            <h2 className="renew-features__title">
              Why is RELSTONE® chosen by top Adjusters, Agents, CFP®, and CPA professionals?
            </h2>
          </div>
          <div className="renew-features__grid">
            {FEATURES.map(({ renderIcon, title, desc }) => (
              <div key={title} className="renew-feature-card">
                <div className="renew-feature-card__icon-wrap">
                  {renderIcon()}
                </div>
                <h3 className="renew-feature-card__title">{title}</h3>
                <p className="renew-feature-card__desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PERKS STRIP ── */}
      <section className="renew-perks">
        <div className="renew-container">
          <h2 className="renew-perks__heading">Insurance professionals prefer our CE courses!</h2>
          <div className="renew-perks__list">
            {PERKS.map(({ renderIcon, text }) => (
              <div key={text} className="renew-perk">
                <div className="renew-perk__icon-wrap">
                  {renderIcon()}
                </div>
                <p className="renew-perk__text">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="renew-bottom-cta">
        <div className="renew-container">
          <div className="renew-bottom-cta__inner">
            <div className="renew-bottom-cta__checkmarks">
              {[
                'Easy online exams with fewer questions',
                'Optional printed textbooks delivered fast',
                'No penalty for failed exams — retake for up to 1 year',
                'CE credits reported to your state automatically',
                'Support 7 days a week, 6am–10pm PST',
              ].map((item) => (
                <div key={item} className="renew-bottom-cta__check-item">
                  <span className="renew-bottom-cta__check-icon">
                    <FaCheckCircle />
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
            <div className="renew-bottom-cta__action">
              <h2 className="renew-bottom-cta__title">Ready to renew your license?</h2>
              <p className="renew-bottom-cta__sub">
                Select your state above and get started today.
              </p>
              <Link to="#state-grid" className="renew-bottom-cta__btn">
                Find My State's Courses
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default InsuranceRenewPage;