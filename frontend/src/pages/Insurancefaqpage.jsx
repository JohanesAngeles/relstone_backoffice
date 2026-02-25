import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaChevronDown,
  FaBookOpen,
  FaClipboardList,
  FaCertificate,
  FaArrowUp,
} from 'react-icons/fa';
import '../styles/pages/Insurancefaqpage.css';

// ── FAQ Data ───────────────────────────────────────────────────────────────
const FAQ_SECTIONS = [
  {
    id: 'courses',
    label: 'Insurance CE Courses FAQ',
    renderIcon: () => <FaBookOpen />,
    questions: [
      {
        q: 'How do I access my insurance CE courses after I\'ve ordered?',
        a: (
          <>
            <p>After your purchase by phone or online, you will receive a receipt for your order by email. The receipt will contain:</p>
            <ol>
              <li>Instructions for accessing your materials</li>
              <li>Username and password confirmation to access the course readings</li>
              <li>Instructions for accessing the final exam online</li>
            </ol>
          </>
        ),
      },
      {
        q: 'How long do I have to complete my insurance continuing education courses after I have ordered?',
        a: (
          <>
            <p>You may take up to <strong>one year</strong> from date of purchase of any insurance CE course to complete the course and pass the exam.</p>
            <p><strong>Note for Texas:</strong> the Ethics course does not require a final exam to receive the credit hours. A series of quizzes must be successfully completed to receive credit hours in Texas.</p>
            <p><strong>Note for North Carolina:</strong> a series of quizzes must be successfully completed before taking the final exam.</p>
          </>
        ),
      },
      {
        q: 'Can insurance CE courses be used for CPA license renewal?',
        a: (
          <>
            <p>Relstone® Insurance School continuing education courses may be used for CPA license renewal in these states:</p>
            <div className="faq-states-list">
              {['AK','AZ','CA','CO','CT','GA','ID','IN','KY','LA','MD','ME','MI','MN','MO','ND','NH','NV','OH','OK','UT','VA','WA','WY'].map(s => (
                <span key={s} className="faq-state-tag">{s}</span>
              ))}
            </div>
          </>
        ),
      },
    ],
  },
  {
    id: 'exams',
    label: 'Insurance Exams FAQ',
    renderIcon: () => <FaClipboardList />,
    questions: [
      {
        q: 'When can I take my final exam?',
        a: (
          <>
            <p>In most states, you can take the final exam at any point.</p>
            <p><strong>North Carolina</strong> requires that you spend 6 hours with the course material, and complete a series of quizzes, before taking the final exam.</p>
            <p><strong>Texas:</strong> a series of quiz sections (60 periods in all) must be successfully completed in order to get full credit for the "Classroom Equivalent Course" (there is NO Final Exam).</p>
          </>
        ),
      },
      {
        q: 'How can I take my insurance CE final exams?',
        a: (
          <>
            <p>For any insurance continuing education course, you may choose to <strong>take your exam online</strong> and have it graded instantly upon completion.</p>
            <p>Or you may take any final exam on paper, and then fax it to us at <strong>619-222-8593</strong> or mail it to us:</p>
            <p className="faq-address">Relstone® / C.E. Credits, Inc.<br />5059 Newport Avenue, #20<br />San Diego, CA 92107</p>
          </>
        ),
      },
      {
        q: 'How long are the final exams for insurance CE courses?',
        a: (
          <>
            <p>In most states, the final exam for many insurance CE courses includes <strong>50 multiple choice or true-false questions</strong>. Shorter courses may have fewer questions.</p>
            <p><strong>For CFP® insurance courses:</strong></p>
            <ul>
              <li>15 hour courses have final exams of <strong>150 questions</strong></li>
              <li>8½ hour courses usually have final exams of <strong>85 questions</strong></li>
            </ul>
          </>
        ),
      },
      {
        q: 'Is there a time limit for completing an exam?',
        a: (
          <p>Regardless of how many questions there may be on the final exam, you are allotted <strong>two hours and thirty minutes</strong> to complete each insurance CE course's final exam.</p>
        ),
      },
      {
        q: 'How long does it take to find out if I\'ve passed the final exam?',
        a: (
          <>
            <p><strong>Online exams</strong> are graded immediately after completion. You will see your pass/fail result and percentage score on screen right away.</p>
            <p><strong>Paper exams</strong> faxed or mailed to us will be graded within 24 hours. We will send your completion certificate(s) by email, fax, or self-addressed stamped envelope.</p>
            <div className="faq-rush-box">
              <strong>⚡ Rush Service Available</strong>
              <p>Fax your final exam (plus affidavit if required) and receive results within <strong>2 business hours</strong> for a <strong>$75 rush fee</strong>. Call toll-free: <a href="tel:18004852660">1-800-485-2660</a></p>
            </div>
            <p className="faq-hours"><strong>Business Hours:</strong><br />
              Mon–Fri: 6am–10pm Pacific (9am–1am Eastern)<br />
              Sat–Sun: 9am–9pm Pacific (12 noon–midnight Eastern)
            </p>
          </>
        ),
      },
      {
        q: 'What grade is required to pass each course?',
        a: (
          <ul>
            <li>Insurance CE courses: <strong>70% or better</strong></li>
            <li>CFP® Code of Ethics courses: <strong>80% or better</strong></li>
            <li>Other CFP® courses: <strong>70% or better</strong></li>
          </ul>
        ),
      },
      {
        q: 'What happens if I don\'t pass a final exam?',
        a: (
          <p>You may take any exam again <strong>once</strong>, at any time up to <strong>one year</strong> from the date of purchase of the individual course. There is no penalty for a failed attempt.</p>
        ),
      },
    ],
  },
  {
    id: 'credits',
    label: 'Insurance Credit Hours FAQ',
    renderIcon: () => <FaCertificate />,
    questions: [
      {
        q: 'Why are my insurance CE courses not being reported to my state\'s department of insurance?',
        a: (
          <>
            <p>If required in your state, you must complete an affidavit as part of the final exam process. You may either:</p>
            <ul>
              <li>Complete the affidavit electronically, <strong>or</strong></li>
              <li>Print, sign, and fax it to us at <strong>(619) 222-8593</strong></li>
            </ul>
            <p>We report completion of courses <strong>every Wednesday</strong> to each state's Department of Insurance.</p>
            <div className="faq-warning-box">
              <strong>⚠ Important:</strong> If your state requires an affidavit and you fail to complete one online or by fax, your credit hours will <strong>not</strong> be reported.
            </div>
          </>
        ),
      },
      {
        q: 'After I receive my completion certificate, how do I renew my insurance license?',
        a: (
          <>
            <p>Relstone® reports the completion of your credit hours to your state Department of Insurance each <strong>Wednesday</strong>. We also pay any reporting fee required by your state — that fee is included in your order at checkout.</p>
            <p>If your state requires you to renew your insurance license, you must complete any required license paperwork and pay any renewal fee to your state. See your Department of Insurance website for more information.</p>
          </>
        ),
      },
      {
        q: 'After I receive my completion certificate, how do I renew my CFP® certificate?',
        a: (
          <>
            <p>Complete your exam at least <strong>15 days before your renewal date</strong>. We report your date of completion each Wednesday to the CFP® Board; however, the CFP® Board may take up to 7–10 business days to post the credits to your record.</p>
            <p>We recommend you go to <a href="https://www.cfp.net" target="_blank" rel="noreferrer">cfp.net</a> and <strong>self-report</strong> the course credits. List us exactly as:</p>
            <div className="faq-sponsor-box"><strong>"Cal-State Exams, Inc."</strong></div>
            <p>Include the hyphen, comma, and period — the CFP® Board website is character-sensitive.</p>
            <p><strong>Additional certificate and reporting fees:</strong></p>
            <ul>
              <li>2nd Certificate &amp; Reporting: $40 (1 course) / $50 (2+ courses)</li>
              <li>3rd Certificate &amp; Reporting: $40 (1 course) / $50 (2+ courses)</li>
            </ul>
          </>
        ),
      },
      {
        q: 'If I\'m using insurance CE for CPA continuing education hours, does Relstone® report these credit hours?',
        a: (
          <p>For CPAs, it is up to the <strong>student</strong> to report completion of insurance credit hours to their state CPA board.</p>
        ),
      },
      {
        q: 'Can I use the same course to renew more than one license?',
        a: (
          <>
            <p>In many states, you may use the same insurance CE course to renew more than one type of license. "Double duty" and "triple duty" options may include:</p>
            <ul>
              <li>Insurance license renewal + CFP® certificate renewal</li>
              <li>Insurance license renewal + CPA renewal</li>
              <li>CFP® certificate renewal + CPA renewal</li>
              <li>Insurance + CFP® + CPA renewal</li>
            </ul>
            <p><strong>Additional certificate and reporting fees:</strong></p>
            <ul>
              <li>2nd Certificate &amp; Reporting: $40 (1 course) / $50 (2+ courses)</li>
              <li>3rd Certificate: $40 (1 course) / $50 (2+ courses)</li>
            </ul>
            <p><em>Note: for CPA renewals, it is up to the student to report completion of insurance credit hours.</em></p>
          </>
        ),
      },
    ],
  },
];

// ── Accordion Item ─────────────────────────────────────────────────────────
const AccordionItem = ({ q, a }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`faq-accordion__item${open ? ' faq-accordion__item--open' : ''}`}>
      <button className="faq-accordion__trigger" onClick={() => setOpen(v => !v)}>
        <span>{q}</span>
        <FaChevronDown className={`faq-accordion__chevron${open ? ' faq-accordion__chevron--open' : ''}`} />
      </button>
      {open && <div className="faq-accordion__body">{a}</div>}
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
const InsuranceFAQPage = () => {
  const [activeSection, setActiveSection] = useState('courses');

  const scrollToSection = (id) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <div className="faq-page">

      {/* ── HERO ── */}
      <section className="faq-hero">
        <div className="faq-container">
          <p className="faq-hero__eyebrow">Relstone® Insurance School</p>
          <h1 className="faq-hero__title">Insurance Continuing Education<br /><span className="faq-hero__accent">Courses FAQ</span></h1>
          <p className="faq-hero__sub">Everything you need to know about your CE courses, exams, and credit hours.</p>
        </div>
      </section>

      {/* ── STICKY TAB NAV ── */}
      <div className="faq-tab-bar">
        <div className="faq-container faq-tab-bar__inner">
          {FAQ_SECTIONS.map(({ id, label, renderIcon }) => (
            <button
              key={id}
              className={`faq-tab${activeSection === id ? ' faq-tab--active' : ''}`}
              onClick={() => scrollToSection(id)}
            >
              {renderIcon()}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── FAQ SECTIONS ── */}
      <div className="faq-body">
        <div className="faq-container faq-body__inner">

          {/* ── Sidebar ── */}
          <aside className="faq-sidebar">
            <p className="faq-sidebar__heading">Sections</p>
            {FAQ_SECTIONS.map(({ id, label, renderIcon }) => (
              <button
                key={id}
                className={`faq-sidebar__link${activeSection === id ? ' faq-sidebar__link--active' : ''}`}
                onClick={() => scrollToSection(id)}
              >
                {renderIcon()}
                <span>{label}</span>
              </button>
            ))}
            <div className="faq-sidebar__divider" />
            <Link to="/insurance/renew" className="faq-sidebar__cta">
              Browse CE Courses →
            </Link>
          </aside>

          {/* ── Main content ── */}
          <main className="faq-main">
            {FAQ_SECTIONS.map(({ id, label, renderIcon, questions }) => (
              <section key={id} id={id} className="faq-section">
                <div className="faq-section__header">
                  <div className="faq-section__icon-wrap">{renderIcon()}</div>
                  <h2 className="faq-section__title">{label}</h2>
                </div>
                <div className="faq-accordion">
                  {questions.map(({ q, a }) => (
                    <AccordionItem key={q} q={q} a={a} />
                  ))}
                </div>
                <button className="faq-back-top" onClick={scrollToTop}>
                  <FaArrowUp /> Back to top
                </button>
              </section>
            ))}
          </main>

        </div>
      </div>

    </div>
  );
};

export default InsuranceFAQPage;