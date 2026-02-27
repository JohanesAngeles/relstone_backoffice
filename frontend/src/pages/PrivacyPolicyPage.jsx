import {
  FaShieldAlt,
  FaComments,
  FaImage,
  FaCookieBite,
  FaGlobe,
  FaShareAlt,
  FaClock,
  FaUserShield,
  FaPaperPlane,
  FaChevronRight,
} from 'react-icons/fa';
import '../styles/pages/PrivacyPolicyPage.css';

// ── Data ────────────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'who-we-are',
    renderIcon: () => <FaShieldAlt />,
    title: 'Who We Are',
    content: (
      <>
        <p>
          Our website address is:{' '}
          <a href="https://relstone.com" target="_blank" rel="noopener noreferrer">
            https://relstone.com
          </a>
        </p>
      </>
    ),
  },
  {
    id: 'comments',
    renderIcon: () => <FaComments />,
    title: 'Comments',
    content: (
      <>
        <p>
          When visitors leave comments on the site we collect the data shown in the comments form,
          and also the visitor's IP address and browser user agent string to help spam detection.
        </p>
        <p>
          An anonymized string created from your email address (also called a hash) may be provided
          to the Gravatar service to see if you are using it. The Gravatar service privacy policy is
          available here:{' '}
          <a href="https://automattic.com/privacy/" target="_blank" rel="noopener noreferrer">
            https://automattic.com/privacy/
          </a>
          . After approval of your comment, your profile picture is visible to the public in the
          context of your comment.
        </p>
      </>
    ),
  },
  {
    id: 'media',
    renderIcon: () => <FaImage />,
    title: 'Media',
    content: (
      <>
        <p>
          If you upload images to the website, you should avoid uploading images with embedded
          location data (EXIF GPS) included. Visitors to the website can download and extract any
          location data from images on the website.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    renderIcon: () => <FaCookieBite />,
    title: 'Cookies',
    content: (
      <>
        <p>
          If you leave a comment on our site you may opt-in to saving your name, email address and
          website in cookies. These are for your convenience so that you do not have to fill in your
          details again when you leave another comment. These cookies will last for one year.
        </p>
        <p>
          If you visit our login page, we will set a temporary cookie to determine if your browser
          accepts cookies. This cookie contains no personal data and is discarded when you close your
          browser.
        </p>
        <p>
          When you log in, we will also set up several cookies to save your login information and
          your screen display choices. Login cookies last for two days, and screen options cookies
          last for a year. If you select &ldquo;Remember Me&rdquo;, your login will persist for two
          weeks. If you log out of your account, the login cookies will be removed.
        </p>
        <p>
          If you edit or publish an article, an additional cookie will be saved in your browser.
          This cookie includes no personal data and simply indicates the post ID of the article you
          just edited. It expires after 1 day.
        </p>
      </>
    ),
  },
  {
    id: 'embedded-content',
    renderIcon: () => <FaGlobe />,
    title: 'Embedded Content from Other Websites',
    content: (
      <>
        <p>
          Articles on this site may include embedded content (e.g. videos, images, articles, etc.).
          Embedded content from other websites behaves in the exact same way as if the visitor has
          visited the other website.
        </p>
        <p>
          These websites may collect data about you, use cookies, embed additional third-party
          tracking, and monitor your interaction with that embedded content, including tracking your
          interaction with the embedded content if you have an account and are logged in to that
          website.
        </p>
      </>
    ),
  },
  {
    id: 'data-sharing',
    renderIcon: () => <FaShareAlt />,
    title: 'Who We Share Your Data With',
    content: (
      <>
        <p>
          If you request a password reset, your IP address will be included in the reset email.
        </p>
      </>
    ),
  },
  {
    id: 'data-retention',
    renderIcon: () => <FaClock />,
    title: 'How Long We Retain Your Data',
    content: (
      <>
        <p>
          If you leave a comment, the comment and its metadata are retained indefinitely. This is so
          we can recognize and approve any follow-up comments automatically instead of holding them
          in a moderation queue.
        </p>
        <p>
          For users that register on our website (if any), we also store the personal information
          they provide in their user profile. All users can see, edit, or delete their personal
          information at any time (except they cannot change their username). Website administrators
          can also see and edit that information.
        </p>
      </>
    ),
  },
  {
    id: 'your-rights',
    renderIcon: () => <FaUserShield />,
    title: 'What Rights You Have Over Your Data',
    content: (
      <>
        <p>
          If you have an account on this site, or have left comments, you can request to receive an
          exported file of the personal data we hold about you, including any data you have provided
          to us. You can also request that we erase any personal data we hold about you. This does
          not include any data we are obliged to keep for administrative, legal, or security
          purposes.
        </p>
      </>
    ),
  },
  {
    id: 'data-destination',
    renderIcon: () => <FaPaperPlane />,
    title: 'Where Your Data Is Sent',
    content: (
      <>
        <p>Visitor comments may be checked through an automated spam detection service.</p>
      </>
    ),
  },
];

// ── Component ───────────────────────────────────────────────────────────────
const PrivacyPolicyPage = () => {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="privacy-page">

      {/* ── HERO ── */}
      <section className="privacy-hero">
        <div className="privacy-container">
          <p className="privacy-hero__eyebrow">Legal</p>
          <h1 className="privacy-hero__title">
            Privacy <span className="privacy-hero__accent">Policy</span>
          </h1>
          <p className="privacy-hero__sub">
            At RELSTONE®, we are committed to protecting your privacy and handling your personal
            data with transparency and care.
          </p>
          <div className="privacy-hero__meta">
            <span className="privacy-hero__badge">
              <FaShieldAlt /> GDPR Compliant
            </span>
            {/* <span className="privacy-hero__updated">Last updated: January 2025</span> */}
          </div>
        </div>
      </section>

      {/* ── BODY ── */}
      <div className="privacy-body">
        <div className="privacy-container privacy-body__inner">

          {/* Sticky TOC sidebar */}
          <aside className="privacy-toc">
            <p className="privacy-toc__label">On this page</p>
            <nav>
              {SECTIONS.map(({ id, title }) => (
                <button key={id} className="privacy-toc__item" onClick={() => scrollTo(id)}>
                  <FaChevronRight className="privacy-toc__chevron" />
                  {title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="privacy-main">
            {SECTIONS.map(({ id, renderIcon, title, content }) => (
              <section key={id} id={id} className="privacy-section">
                <div className="privacy-section__header">
                  <div className="privacy-section__icon">{renderIcon()}</div>
                  <h2 className="privacy-section__title">{title}</h2>
                </div>
                <div className="privacy-section__body">{content}</div>
              </section>
            ))}
          </main>

        </div>
      </div>

      {/* ── BOTTOM CTA ── */}
      <section className="privacy-cta">
        <div className="privacy-container">
          <div className="privacy-cta__inner">
            <div>
              <h2 className="privacy-cta__title">Questions About Your Privacy?</h2>
              <p className="privacy-cta__sub">
                Reach out to our team directly — real people, no phone menus.
              </p>
            </div>
            <div className="privacy-cta__actions">
              <a href="tel:18008775445" className="privacy-cta__btn privacy-cta__btn--primary">
                Call 1-800-877-5445
              </a>
              <a href="/contact" className="privacy-cta__btn privacy-cta__btn--ghost">
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default PrivacyPolicyPage;