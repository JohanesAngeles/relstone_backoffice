import {
  FaPhone,
  FaGraduationCap,
  FaStar,
  FaTrophy,
  FaCheckSquare,
  FaBolt,
  FaShieldAlt,
  FaDollarSign,
  FaHeadset,
  FaQuoteLeft,
  FaBuilding,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import '../styles/pages/Aboutpage.css';

// ── Data ────────────────────────────────────────────────────────────────────
const STATS = [
  { value: '47+', label: 'Years in Business' },
  { value: '4M+', label: 'Courses Completed' },
  { value: '47',  label: 'States Served' },
  { value: '1978', label: 'Founded' },
];

const HIGHLIGHTS = [
  {
    renderIcon: () => <FaGraduationCap />,
    title: 'How to Get Your CA Real Estate License',
    desc: 'Complete state-approved courses online or with textbooks. We guide you through every step.',
  },
  {
    renderIcon: () => <FaStar />,
    title: '4+ Million Courses Completed',
    desc: 'Using the most effective learning format to help you pass fast and succeed!',
  },
  {
    renderIcon: () => <FaTrophy />,
    title: 'Trusted Since 1974',
    desc: '47+ years of proven success in insurance CE and CFP® certification courses.',
  },
];

const WHY_ITEMS = [
  {
    renderIcon: () => <FaBolt />,
    title: 'Easy',
    desc: 'Easy to work at your own pace online courses (printed textbooks also available), and shorter exams.',
  },
  {
    renderIcon: () => <FaCheckSquare />,
    title: 'Effective',
    desc: 'Learn at your own pace and easily re-read anything — with the most effective and fastest learning format!',
  },
  {
    renderIcon: () => <FaDollarSign />,
    title: 'Affordable',
    desc: "We'll beat any advertised price.",
  },
  {
    renderIcon: () => <FaHeadset />,
    title: '5-Star Customer Service',
    desc: 'Call 1-800-877-5445 to speak directly with an experienced CE advisor. No phone menus — just real people.',
  },
];

const LICENSES = [
  'Insurance License',
  'CFP® Certificate',
  'Real Estate License',
  'CPA Renewal Courses',
  'State Approved',
];

const PLACEHOLDER_TESTIMONIALS = [
  {
    text: 'Very thorough information for the insurance industry, and the staff at Relstone are extremely professional and helpful.',
    name: 'Diana Miller Mccravy',
    location: 'Villa Rica, GA',
  },
  {
    text: 'Easy access and the printable book was easy to print as well. Whenever I had a question someone was always available to answer.',
    name: 'Adrian J.',
    location: 'Gretna, LA',
  },
  {
    text: 'Relstone was very easy to use. Reasonably priced, 50-question exams — just the right length. Good website to get your continuing ed.',
    name: 'Quentin Lazaro',
    location: 'Lincoln, NE',
  },
  {
    text: 'Have been using RELSTONE for my Insurance and CFP CEs for over 7 years and am very happy. Its friendly, clear and to the point.',
    name: 'Placido Blanco',
    location: 'Tampa, FL',
  },
];

// ── Component ───────────────────────────────────────────────────────────────
const AboutPage = () => {
  return (
    <div className="about-page">

      {/* ── HERO ── */}
      <section className="about-hero">
        <div className="about-container">
          <p className="about-hero__eyebrow">About Us</p>
          <h1 className="about-hero__title">
            Real Estate &amp; Insurance Schools<br />
            <span className="about-hero__accent">Since 1978</span>
          </h1>
          <p className="about-hero__sub">
            Real Estate License Services — helping agents, brokers, adjusters, CFPs, and CPAs
            complete their continuing education for over 47 years.
          </p>

          {/* Phone CTA */}
          <a href="tel:18008775445" className="about-hero__phone">
            <FaPhone className="about-hero__phone-icon" />
            <div>
              <span className="about-hero__phone-label">Call Toll-Free</span>
              <span className="about-hero__phone-number">1-800-877-5445</span>
            </div>
          </a>
          <p className="about-hero__hours">
            7 Days a Week: 6 am–10 pm Pacific &nbsp;·&nbsp; 9 am–1 am Eastern
          </p>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <div className="about-stats-bar">
        <div className="about-container about-stats-bar__inner">
          {STATS.map(({ value, label }) => (
            <div key={label} className="about-stat">
              <span className="about-stat__value">{value}</span>
              <span className="about-stat__label">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── HIGHLIGHTS ── */}
      <section className="about-highlights">
        <div className="about-container">
          <div className="about-highlights__grid">
            {HIGHLIGHTS.map(({ renderIcon, title, desc }) => (
              <div key={title} className="about-highlight-card">
                <div className="about-highlight-card__icon">{renderIcon()}</div>
                <h3 className="about-highlight-card__title">{title}</h3>
                <p className="about-highlight-card__desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CHOOSE RELSTONE ── */}
      <section className="about-choose">
        <div className="about-container">
          <div className="about-choose__inner">
            {/* Left: text */}
            <div className="about-choose__content">
              <h2 className="about-choose__title">Choose RELSTONE® For:</h2>
              <p className="about-choose__body">
                Proven effective state-approved Insurance CE and CFP® Certificate courses for
                47 states and District of Columbia. Convenient online or home study (with
                textbooks) — since 1974.
              </p>
              <p className="about-choose__body">
                Get your California Real Estate Salesperson or Broker License, or renew your
                license with Real Estate Continuing Education credits online or home study
                (with textbooks) — in San Diego since 1978.
              </p>
              <ul className="about-choose__licenses">
                {LICENSES.map(l => (
                  <li key={l}>
                    <span className="about-choose__check"><FaCheckSquare /></span>
                    {l}
                  </li>
                ))}
              </ul>
            </div>

            {/* Right: big number */}
            <div className="about-choose__number-block">
              <span className="about-choose__big-number">4,000,000+</span>
              <span className="about-choose__big-label">Courses Successfully Completed!</span>
              <span className="about-choose__big-sub">Trusted by professionals nationwide since 1978</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY WE'RE #1 ── */}
      <section className="about-why">
        <div className="about-container">
          <h2 className="about-section-title">Why We're the #1 Choice</h2>
          <p className="about-section-sub">
            Have you checked how long most continuing education insurance schools have been in
            business? Most you'll find online have appeared fairly recently. But RELSTONE® has
            been helping insurance agents, adjusters, CFPs and CPAs to successfully complete
            insurance CE courses for the past 47 years!
          </p>
          <div className="about-why__grid">
            {WHY_ITEMS.map(({ renderIcon, title, desc }) => (
              <div key={title} className="about-why__card">
                <div className="about-why__card-icon">{renderIcon()}</div>
                <h3 className="about-why__card-title">{title}</h3>
                <p className="about-why__card-desc">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROVEN EFFECTIVE ── */}
      <section className="about-proven">
        <div className="about-container">
          <div className="about-proven__inner">
            <div className="about-proven__block">
              <div className="about-proven__icon-wrap"><FaShieldAlt /></div>
              <h3 className="about-proven__title">Proven Effective</h3>
              <p className="about-proven__body">
                Since 1974, our courses have been used by hundreds of thousands to successfully
                complete their insurance CE. Over the last 47 years, our textbooks, courses, and
                exams have been extensively tested by professionals from 47 states. Our founder
                is a long-time educator and popular college professor — he created these courses
                himself and stands 100% behind every one.
              </p>
            </div>
            <div className="about-proven__divider" />
            <div className="about-proven__block">
              <div className="about-proven__icon-wrap"><FaBuilding /></div>
              <h3 className="about-proven__title">Since 1978 — San Diego, CA</h3>
              <p className="about-proven__body">
                Real Estate License Services (through C.E. Credits, Inc.) has been offering
                state-approved insurance license and CFP® certificate courses in 47 states and
                the District of Columbia. We've also been helping California real estate agents
                and brokers get and renew their licenses for more than 43 years.
              </p>
              <div className="about-proven__location">
                <FaMapMarkerAlt />
                <span>San Diego, California — since 1978</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS (placeholder) ── */}
      <section className="about-testimonials">
        <div className="about-container">
          <h2 className="about-section-title">See What Our Customers Say!</h2>
          <p className="about-section-sub">
            Testimonials are dynamically loaded from customer reviews.
          </p>
          <div className="about-testimonials__grid">
            {PLACEHOLDER_TESTIMONIALS.map(({ text, name, location }) => (
              <div key={name} className="about-testimonial-card">
                <FaQuoteLeft className="about-testimonial-card__quote" />
                <div className="about-testimonial-card__stars">
                  {[...Array(5)].map((_, i) => <FaStar key={i} />)}
                </div>
                <p className="about-testimonial-card__text">{text}</p>
                <div className="about-testimonial-card__author">
                  <span className="about-testimonial-card__name">{name}</span>
                  <span className="about-testimonial-card__location">{location}</span>
                </div>
              </div>
            ))}
          </div>
          <p className="about-testimonials__note">
            ✦ Placeholder — replace with dynamic testimonials from your database
          </p>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="about-cta">
        <div className="about-container">
          <div className="about-cta__inner">
            <div>
              <h2 className="about-cta__title">Ready to Get Started?</h2>
              <p className="about-cta__sub">
                Join thousands of professionals who trust RELSTONE® for their licensing needs.
              </p>
              <div className="about-cta__badges">
                {['State Approved', 'Self-Paced', 'Expert Support'].map(b => (
                  <span key={b} className="about-cta__badge">
                    <FaCheckSquare /> {b}
                  </span>
                ))}
              </div>
            </div>
            <div className="about-cta__actions">
              <a href="tel:18008775445" className="about-cta__btn about-cta__btn--primary">
                <FaPhone /> Call 1-800-877-5445
              </a>
              <a href="/insurance/renew" className="about-cta__btn about-cta__btn--ghost">
                Browse CE Courses
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default AboutPage;