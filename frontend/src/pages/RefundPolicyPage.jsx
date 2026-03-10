import {
  FaShieldAlt,
  FaBoxOpen,
  FaBan,
  FaReceipt,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaTag,
  FaExchangeAlt,
  FaGift,
  FaTruck,
  FaQuestionCircle,
  FaChevronRight,
  FaPhone,
  FaEnvelope,
} from 'react-icons/fa';
import '../styles/pages/RefundPolicyPage.css';

// ── Data ────────────────────────────────────────────────────────────────────
const SECTIONS = [
  {
    id: 'overview',
    renderIcon: () => <FaShieldAlt />,
    title: 'Overview',
    content: (
      <>
        <p>
          Our refund and returns policy lasts <strong>30 days</strong>. If 30 days have passed
          since your purchase, we can't offer you a full refund or exchange.
        </p>
        <p>
          To be eligible for a return, your item must be unused and in the same condition that you
          received it. It must also be in the original packaging.
        </p>
      </>
    ),
  },
  {
    id: 'non-returnable',
    renderIcon: () => <FaBan />,
    title: 'Non-Returnable Items',
    content: (
      <>
        <p>
          Several types of goods are exempt from being returned. Perishable goods such as food,
          flowers, newspapers or magazines cannot be returned. We also do not accept products that
          are intimate or sanitary goods, hazardous materials, or flammable liquids or gases.
        </p>
        <p>Additional non-returnable items:</p>
        <ul className="refund-list">
          <li>Gift cards</li>
          <li>Downloadable software products</li>
          <li>Some health and personal care items</li>
        </ul>
        <p>To complete your return, we require a receipt or proof of purchase.</p>
        <p className="refund-notice">
          Please do not send your purchase back to the manufacturer.
        </p>
      </>
    ),
  },
  {
    id: 'partial-refunds',
    renderIcon: () => <FaExclamationTriangle />,
    title: 'Partial Refunds',
    content: (
      <>
        <p>There are certain situations where only partial refunds are granted:</p>
        <ul className="refund-list">
          <li>Book with obvious signs of use</li>
          <li>
            CD, DVD, VHS tape, software, video game, cassette tape, or vinyl record that has been
            opened
          </li>
          <li>
            Any item not in its original condition, is damaged or missing parts for reasons not due
            to our error
          </li>
          <li>Any item that is returned more than 30 days after delivery</li>
        </ul>
      </>
    ),
  },
  {
    id: 'refunds',
    renderIcon: () => <FaMoneyBillWave />,
    title: 'Refunds',
    content: (
      <>
        <p>
          Once your return is received and inspected, we will send you an email to notify you that
          we have received your returned item. We will also notify you of the approval or rejection
          of your refund.
        </p>
        <p>
          If you are approved, your refund will be processed and a credit will automatically be
          applied to your credit card or original method of payment within a certain number of days.
        </p>
      </>
    ),
  },
  {
    id: 'late-refunds',
    renderIcon: () => <FaReceipt />,
    title: 'Late or Missing Refunds',
    content: (
      <>
        <p>If you haven't received a refund yet, first check your bank account again.</p>
        <p>
          Then contact your credit card company — it may take some time before your refund is
          officially posted.
        </p>
        <p>
          Next, contact your bank. There is often some processing time before a refund is posted.
        </p>
        <p>
          If you've done all of this and still have not received your refund, please contact us at{' '}
          <a href="mailto:support@relstone.com">support@relstone.com</a>.
        </p>
      </>
    ),
  },
  {
    id: 'sale-items',
    renderIcon: () => <FaTag />,
    title: 'Sale Items',
    content: (
      <>
        <p>
          Only regular priced items may be refunded. <strong>Sale items cannot be refunded.</strong>
        </p>
      </>
    ),
  },
  {
    id: 'exchanges',
    renderIcon: () => <FaExchangeAlt />,
    title: 'Exchanges',
    content: (
      <>
        <p>
          We only replace items if they are defective or damaged. If you need to exchange it for the
          same item, send us an email at{' '}
          <a href="mailto:support@relstone.com">support@relstone.com</a> and send your item to our
          return address.
        </p>
      </>
    ),
  },
  {
    id: 'gifts',
    renderIcon: () => <FaGift />,
    title: 'Gifts',
    content: (
      <>
        <p>
          If the item was marked as a gift when purchased and shipped directly to you, you'll receive
          a gift credit for the value of your return. Once the returned item is received, a gift
          certificate will be mailed to you.
        </p>
        <p>
          If the item wasn't marked as a gift when purchased, or the gift giver had the order
          shipped to themselves to give to you later, we will send a refund to the gift giver and
          they will find out about your return.
        </p>
      </>
    ),
  },
  {
    id: 'shipping',
    renderIcon: () => <FaTruck />,
    title: 'Shipping Returns',
    content: (
      <>
        <p>
          To return your product, mail it to our return address. Please contact us for the current
          return shipping address before sending any items.
        </p>
        <p>
          You will be responsible for paying for your own shipping costs for returning your item.{' '}
          <strong>Shipping costs are non-refundable.</strong> If you receive a refund, the cost of
          return shipping will be deducted from your refund.
        </p>
        <p>
          Depending on where you live, the time it may take for your exchanged product to reach you
          may vary.
        </p>
        <p>
          If you are returning more expensive items, you may consider using a trackable shipping
          service or purchasing shipping insurance. We don't guarantee that we will receive your
          returned item.
        </p>
      </>
    ),
  },
  {
    id: 'help',
    renderIcon: () => <FaQuestionCircle />,
    title: 'Need Help?',
    content: (
      <>
        <p>
          Contact us at{' '}
          <a href="mailto:support@relstone.com">support@relstone.com</a> for questions related to
          refunds and returns.
        </p>
      </>
    ),
  },
];

// ── Component ────────────────────────────────────────────────────────────────
const RefundPolicyPage = () => {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="refund-page">

      {/* ── HERO ── */}
      <section className="refund-hero">
        <div className="refund-container">
          <p className="refund-hero__eyebrow">Legal</p>
          <h1 className="refund-hero__title">
            Refund <span className="refund-hero__accent">Policy</span>
          </h1>
          <p className="refund-hero__sub">
            At RELSTONE®, we stand behind our courses. Review our refund and returns policy below
            so you know exactly what to expect.
          </p>
          <div className="refund-hero__meta">
            <span className="refund-hero__badge">
              <FaShieldAlt /> 30-Day Return Window
            </span>
          </div>
        </div>
      </section>

      {/* ── BODY ── */}
      <div className="refund-body">
        <div className="refund-container refund-body__inner">

          {/* Sticky TOC sidebar */}
          <aside className="refund-toc">
            <p className="refund-toc__label">On this page</p>
            <nav>
              {SECTIONS.map(({ id, title }) => (
                <button key={id} className="refund-toc__item" onClick={() => scrollTo(id)}>
                  <FaChevronRight className="refund-toc__chevron" />
                  {title}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="refund-main">
            {SECTIONS.map(({ id, renderIcon, title, content }) => (
              <section key={id} id={id} className="refund-section">
                <div className="refund-section__header">
                  <div className="refund-section__icon">{renderIcon()}</div>
                  <h2 className="refund-section__title">{title}</h2>
                </div>
                <div className="refund-section__body">{content}</div>
              </section>
            ))}
          </main>

        </div>
      </div>

      {/* ── BOTTOM CTA ── */}
      <section className="refund-cta">
        <div className="refund-container">
          <div className="refund-cta__inner">
            <div>
              <h2 className="refund-cta__title">Questions About a Refund?</h2>
              <p className="refund-cta__sub">
                Reach out to our team directly — real people, no phone menus.
              </p>
            </div>
            <div className="refund-cta__actions">
              <a href="tel:18008775445" className="refund-cta__btn refund-cta__btn--primary">
                <FaPhone /> Call 1-800-877-5445
              </a>
              <a href="mailto:support@relstone.com" className="refund-cta__btn refund-cta__btn--ghost">
                <FaEnvelope /> Email Us
              </a>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default RefundPolicyPage;