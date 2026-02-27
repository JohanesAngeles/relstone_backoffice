import { useState } from 'react';
import {
  FaEnvelope,
  FaPhone,
  FaClock,
  FaIdCard,
  FaPaperPlane,
  FaCheckCircle,
} from 'react-icons/fa';
import '../styles/pages/ContactUsPage.css';

// ── Info blocks data ─────────────────────────────────────────────────────────
const INFO_BLOCKS = [
  {
    id: 'email',
    renderIcon: () => <FaEnvelope />,
    title: 'Email Us',
    content: (
      <>
        <p><a href="mailto:support@relstone.com">support@relstone.com</a></p>
        <p className="contact-info-card__note">We typically respond within 1 business day.</p>
      </>
    ),
  },
  {
    id: 'phone',
    renderIcon: () => <FaPhone />,
    title: 'Call Us',
    content: (
      <>
        <p><a href="tel:18008775445">1-800-877-5445</a></p>
        <p className="contact-info-card__note">Real people, no phone menus.</p>
      </>
    ),
  },
  {
    id: 'hours',
    renderIcon: () => <FaClock />,
    title: 'Hours',
    content: (
      <>
        <p>Monday – Friday: 9am – 5pm PST</p>
        <p>Saturday – Sunday: Closed</p>
      </>
    ),
  },
  {
    id: 'licensing',
    renderIcon: () => <FaIdCard />,
    title: 'Licensing Information',
    content: (
      <>
        <p>DRE CE Sponsor ID: #1035</p>
        <p>DRE Pre-License Sponsor: #S0199</p>
      </>
    ),
  },
];

// ── Component ────────────────────────────────────────────────────────────────
const ContactUsPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Replace with real API call
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="contact-page">

      {/* ── HERO ── */}
      <section className="contact-hero">
        <div className="contact-container">
          <p className="contact-hero__eyebrow">Support</p>
          <h1 className="contact-hero__title">
            Contact <span className="contact-hero__accent">Us</span>
          </h1>
          <p className="contact-hero__sub">
            We're here to help with any questions about our courses, your account, or licensing
            requirements.
          </p>
          <div className="contact-hero__meta">
            <span className="contact-hero__badge">
              <FaClock /> Mon–Fri, 9am–5pm PST
            </span>
          </div>
        </div>
      </section>

      {/* ── BODY ── */}
      <div className="contact-body">
        <div className="contact-container contact-body__inner">

          {/* ── LEFT: Info cards ── */}
          <aside className="contact-sidebar">
            <p className="contact-sidebar__label">Get In Touch</p>
            <p className="contact-sidebar__lead">
              Have questions about our courses or need assistance with your account? Our team is
              ready to help.
            </p>
            <div className="contact-info-cards">
              {INFO_BLOCKS.map(({ id, renderIcon, title, content }) => (
                <div key={id} className="contact-info-card">
                  <div className="contact-info-card__header">
                    <div className="contact-info-card__icon">{renderIcon()}</div>
                    <h3 className="contact-info-card__title">{title}</h3>
                  </div>
                  <div className="contact-info-card__body">{content}</div>
                </div>
              ))}
            </div>
          </aside>

          {/* ── RIGHT: Form ── */}
          <main className="contact-main">
            <div className="contact-form-card">
              <div className="contact-form-card__header">
                <div className="contact-form-card__icon"><FaPaperPlane /></div>
                <h2 className="contact-form-card__title">Send Us a Message</h2>
              </div>

              {submitted ? (
                <div className="contact-success">
                  <FaCheckCircle className="contact-success__icon" />
                  <h3 className="contact-success__title">Message Sent!</h3>
                  <p className="contact-success__sub">
                    Thanks for reaching out. We'll get back to you within 1 business day.
                  </p>
                  <button
                    className="contact-success__reset"
                    onClick={() => {
                      setSubmitted(false);
                      setForm({ name: '', email: '', subject: '', message: '' });
                    }}
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form className="contact-form" onSubmit={handleSubmit} noValidate>
                  <div className="contact-form__row contact-form__row--two">
                    <div className="contact-form__group">
                      <label className="contact-form__label" htmlFor="name">Your name</label>
                      <input
                        id="name" name="name" type="text"
                        className="contact-form__input"
                        value={form.name} onChange={handleChange}
                        placeholder="Jane Smith" required
                      />
                    </div>
                    <div className="contact-form__group">
                      <label className="contact-form__label" htmlFor="email">Your email</label>
                      <input
                        id="email" name="email" type="email"
                        className="contact-form__input"
                        value={form.email} onChange={handleChange}
                        placeholder="jane@example.com" required
                      />
                    </div>
                  </div>

                  <div className="contact-form__row">
                    <div className="contact-form__group">
                      <label className="contact-form__label" htmlFor="subject">Subject</label>
                      <input
                        id="subject" name="subject" type="text"
                        className="contact-form__input"
                        value={form.subject} onChange={handleChange}
                        placeholder="How can we help?" required
                      />
                    </div>
                  </div>

                  <div className="contact-form__row">
                    <div className="contact-form__group">
                      <label className="contact-form__label" htmlFor="message">
                        Your message <span className="contact-form__optional">(optional)</span>
                      </label>
                      <textarea
                        id="message" name="message"
                        className="contact-form__textarea"
                        value={form.message} onChange={handleChange}
                        placeholder="Tell us more about your question…"
                        rows={6}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className={`contact-form__submit${loading ? ' contact-form__submit--loading' : ''}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <><span className="contact-form__spinner" /> Sending…</>
                    ) : (
                      <><FaPaperPlane /> Submit</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </main>

        </div>
      </div>

      {/* ── BOTTOM CTA ── */}
      <section className="contact-cta">
        <div className="contact-container">
          <div className="contact-cta__inner">
            <div>
              <h2 className="contact-cta__title">Prefer to Call?</h2>
              <p className="contact-cta__sub">
                Real people, no phone menus — just straightforward help.
              </p>
            </div>
            <div className="contact-cta__actions">
              <a href="tel:18008775445" className="contact-cta__btn contact-cta__btn--primary">
                <FaPhone /> Call 1-800-877-5445
              </a>
              <a href="mailto:support@relstone.com" className="contact-cta__btn contact-cta__btn--ghost">
                <FaEnvelope /> Email Us
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ContactUsPage;