import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getStateFull } from '../services/insuranceService';
import useCart from '../context/useCart';
import {
  FaShoppingCart,
  FaClock,
  FaCheck,
  FaBalanceScale,
  FaBook,
  FaFax,
  FaCheckCircle,
} from 'react-icons/fa';

const InsuranceStatePage = () => {
  const { slug } = useParams();
  const [stateData, setStateData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [textbookSelections, setTextbookSelections] = useState({});

  const { addToCart, removeFromCart, isInCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { state, courses, packages } = await getStateFull(slug);
        setStateData(state);
        setCourses(courses);
        setPackages(packages);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  const toggleTextbook = (id) => {
    setTextbookSelections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getPrice = (course) => {
    const base = course.price;
    const addon = textbookSelections[course._id] ? course.printedTextbookPrice : 0;
    return (base + addon).toFixed(2);
  };

  const handleCourseCart = (course) => {
    if (isInCart(course._id)) {
      removeFromCart(course._id);
    } else {
      addToCart({
        id:            course._id,
        type:          'course',
        name:          course.name,
        stateSlug:     slug,
        stateName:     stateData.name,
        price:         course.price,
        creditHours:   course.creditHours,
        withTextbook:  !!textbookSelections[course._id],
        textbookPrice: course.printedTextbookPrice || 0,
      });
    }
  };

  const handlePackageCart = (pkg) => {
    if (isInCart(pkg._id)) {
      removeFromCart(pkg._id);
    } else {
      addToCart({
        id:           pkg._id,
        type:         'package',
        name:         pkg.name,
        stateSlug:    slug,
        stateName:    stateData.name,
        price:        pkg.price,
        creditHours:  pkg.totalHours,
        withTextbook: false,
        textbookPrice: 0,
      });
    }
  };

  if (loading) return (
    <div style={styles.loadingWrap}>
      <div style={styles.spinner} />
      <p style={styles.loadingText}>Loading courses...</p>
    </div>
  );

  if (error) return (
    <div style={styles.errorWrap}>
      <p>❌ {error}</p>
    </div>
  );

  if (!stateData) return null;

  return (
    <div style={styles.page}>

      {/* ── Hero ── */}
      <div style={styles.hero}>
        <div style={styles.heroInner}>
          <span style={styles.heroBadge}>{stateData.name} Insurance CE</span>
          <h1 style={styles.heroTitle}>{stateData.heroTitle}</h1>
          <p style={styles.heroSub}>{stateData.providerInfo}</p>
        </div>
      </div>

      <div style={styles.container}>

        {/* ── Why Relstone ── */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>Why Relstone for {stateData.name} Insurance CE</h2>
          <div style={styles.bulletGrid}>
            {stateData.introBullets.map((bullet, i) => (
              <div key={i} style={styles.bulletCard}>
                <span style={styles.checkBox}><FaCheck style={styles.checkIcon} /></span>
                <span style={styles.bulletText}>{bullet}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── CE Info ── */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>{stateData.name} Insurance Continuing Education Courses</h2>
          <div style={styles.ceList}>
            {stateData.ceBullets.map((bullet, i) => (
              <div key={i} style={styles.ceItem}>
                <span style={styles.checkBox}><FaCheck style={styles.checkIcon} /></span>
                <span>{bullet}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Requirements ── */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>{stateData.name} Insurance CE Guide</h2>
          <p style={styles.sectionSubtitle}>State Of {stateData.name} Department Of Insurance Requirements</p>
          <div style={styles.reqGrid}>
            <div style={styles.reqCard}>
              <span style={styles.reqLabel}>Producers</span>
              <span style={styles.reqValue}>{stateData.requirements.producerHours}</span>
              <span style={styles.reqNote}>{stateData.requirements.producerEthicsHours}</span>
            </div>
            <div style={styles.reqCard}>
              <span style={styles.reqLabel}>Service Reps</span>
              <span style={styles.reqValue}>{stateData.requirements.serviceRepHours}</span>
              <span style={styles.reqNote}>{stateData.requirements.serviceRepEthicsHours}</span>
            </div>
            <div style={styles.reqCard}>
              <span style={styles.reqLabel}>Renewal Deadline</span>
              <span style={styles.reqNote}>{stateData.requirements.renewalDeadline}</span>
            </div>
            <div style={styles.reqCard}>
              <span style={styles.reqLabel}>Carry Over</span>
              <span style={styles.reqNote}>{stateData.requirements.carryOverHours}</span>
            </div>
          </div>
          <ul style={styles.notesList}>
            {stateData.requirements.notes.map((note, i) => (
              <li key={i} style={styles.notesItem}>
                <span style={styles.checkBox}><FaCheck style={styles.checkIcon} /></span>
                {note}
              </li>
            ))}
          </ul>
        </section>

        {/* ── Exam Instructions ── */}
        <section style={styles.section}>
          <h2 style={styles.sectionTitle}>To Take Your Final Exam Online</h2>
          <div style={styles.examSteps}>
            {stateData.examInstructions.online.map((step, i) => (
              <div key={i} style={styles.examStep}>
                <span style={styles.examNum}>{i + 1}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
          <div style={styles.faxBanner}>
            <FaFax style={styles.faxIcon} />
            {stateData.examInstructions.faxInfo}
          </div>
        </section>

        {/* ── Packages ── */}
        {packages.length > 0 && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>
              Complete CE Packages — Renew Your {stateData.name} Insurance License
            </h2>
            <div style={styles.cardGrid}>
              {packages.map((pkg) => {
                const inCart = isInCart(pkg._id);
                return (
                  <div key={pkg._id} style={styles.pkgCard}>
                    <h3 style={styles.pkgName}>{pkg.name}</h3>
                    <div style={styles.pkgMeta}>
                      <FaClock style={styles.pkgMetaIcon} />
                      <span style={styles.pkgHours}>{pkg.totalHours} Credit Hours</span>
                    </div>
                    <ul style={styles.pkgCourses}>
                      {pkg.coursesIncluded.map((c, i) => (
                        <li key={i} style={styles.pkgCourseItem}>
                          <span style={styles.checkBox}><FaCheck style={styles.checkIcon} /></span>
                          {c}
                        </li>
                      ))}
                    </ul>
                    <div style={styles.pkgFooter}>
                      <span style={styles.pkgPrice}>${pkg.price.toFixed(2)}</span>
                      <button
                        style={inCart ? styles.cartBtnAdded : styles.cartBtn}
                        onClick={() => handlePackageCart(pkg)}
                      >
                        {inCart
                          ? <><FaCheckCircle /> Added</>
                          : <><FaShoppingCart /> Add to Cart</>
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Individual Courses ── */}
        {courses.length > 0 && (
          <section style={styles.section}>
            <h2 style={styles.sectionTitle}>Individual Courses</h2>
            <div style={styles.cardGrid}>
              {courses.map((course) => {
                const inCart = isInCart(course._id);
                return (
                  <div key={course._id} style={styles.courseCard}>
                    <div style={styles.courseTypeTag}>
                      {course.courseType === 'Ethics'
                        ? <><FaBalanceScale style={styles.courseTypeIcon} /> Ethics</>
                        : <><FaBook style={styles.courseTypeIcon} /> General</>
                      }
                    </div>
                    <h3 style={styles.courseName}>{course.shortName}</h3>
                    <p style={styles.courseDesc}>{course.description}</p>
                    <div style={styles.courseMeta}>
                      <FaClock style={styles.courseMetaIcon} />
                      <span style={styles.courseHours}>{course.creditHours} Credit Hours</span>
                    </div>

                    {course.hasPrintedTextbook && (
                      <label style={styles.textbookLabel}>
                        <input
                          type="checkbox"
                          checked={!!textbookSelections[course._id]}
                          onChange={() => toggleTextbook(course._id)}
                          style={styles.checkbox}
                        />
                        <span>
                          Add Printed Textbook
                          <strong style={styles.textbookPrice}>
                            {' '}(+${course.printedTextbookPrice.toFixed(2)})
                          </strong>
                        </span>
                      </label>
                    )}

                    <div style={styles.courseFooter}>
                      <span style={styles.coursePrice}>${getPrice(course)}</span>
                      <button
                        style={inCart ? styles.cartBtnAdded : styles.cartBtn}
                        onClick={() => handleCourseCart(course)}
                      >
                        {inCart
                          ? <><FaCheckCircle /> Added</>
                          : <><FaShoppingCart /> Add to Cart</>
                        }
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

// ── Color Palette ───────────────────────────────────────────────
const PRIMARY     = '#2EABFE';
const DARK        = '#091925';
const GREEN       = '#22c55e';
const TEXT        = '#1a1a1a';
const MUTED       = '#6b7280';
const BORDER      = '#e5e7eb';
const CARD_BG     = '#ffffff';
const CARD_SHADOW = '0 1px 4px rgba(0,0,0,0.08)';

const styles = {
  page: { backgroundColor: '#f4f8fb', minHeight: '100vh', color: TEXT },
  loadingWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '60vh', color: MUTED, gap: 16,
  },
  spinner: {
    width: 36, height: 36,
    border: `3px solid ${BORDER}`, borderTop: `3px solid ${PRIMARY}`, borderRadius: '50%',
  },
  loadingText: { color: MUTED, fontSize: 14 },
  errorWrap: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    minHeight: '60vh', color: '#ef4444',
  },
  hero: {
    background: `linear-gradient(135deg, ${PRIMARY} 0%, ${DARK} 100%)`,
    padding: '64px 24px', textAlign: 'center',
  },
  heroInner: { maxWidth: 720, margin: '0 auto' },
  heroBadge: {
    display: 'inline-block', background: 'rgba(255,255,255,0.15)', color: '#fff',
    fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
    padding: '4px 16px', borderRadius: 20, marginBottom: 20,
    border: '1px solid rgba(255,255,255,0.25)',
  },
  heroTitle: {
    fontSize: 'clamp(26px, 4vw, 44px)', fontWeight: 700, color: '#ffffff',
    margin: '0 0 12px', lineHeight: 1.2,
  },
  heroSub: { color: 'rgba(255,255,255,0.7)', fontSize: 15, margin: 0 },
  container: { maxWidth: 1100, margin: '0 auto', padding: '52px 24px' },
  section: { marginBottom: 64 },
  sectionTitle: {
    fontSize: 22, fontWeight: 700, color: DARK, marginBottom: 6,
    paddingBottom: 12, borderBottom: `2px solid ${BORDER}`,
  },
  sectionSubtitle: { color: MUTED, fontSize: 14, marginBottom: 20, marginTop: 4 },
  checkBox: {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 20, height: 20, borderRadius: 5, background: GREEN, flexShrink: 0,
  },
  checkIcon: { color: '#fff', fontSize: 10 },
  bulletGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 12, marginTop: 20,
  },
  bulletCard: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    background: CARD_BG, border: `1px solid ${BORDER}`,
    borderRadius: 10, padding: '14px 16px', boxShadow: CARD_SHADOW,
  },
  bulletText: { fontSize: 14, color: TEXT, lineHeight: 1.5 },
  ceList: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 },
  ceItem: {
    display: 'flex', alignItems: 'flex-start', gap: 10,
    fontSize: 14, color: TEXT, lineHeight: 1.6,
  },
  reqGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: 12, marginTop: 20, marginBottom: 20,
  },
  reqCard: {
    background: CARD_BG, border: `1px solid ${BORDER}`,
    borderTop: `3px solid ${PRIMARY}`, borderRadius: 10,
    padding: '16px 20px', display: 'flex', flexDirection: 'column',
    gap: 6, boxShadow: CARD_SHADOW,
  },
  reqLabel: {
    fontSize: 11, fontWeight: 700, color: PRIMARY,
    letterSpacing: '0.1em', textTransform: 'uppercase',
  },
  reqValue: { fontSize: 20, fontWeight: 700, color: DARK },
  reqNote: { fontSize: 13, color: MUTED, lineHeight: 1.5 },
  notesList: { listStyle: 'none', padding: 0, margin: 0 },
  notesItem: {
    display: 'flex', alignItems: 'flex-start', gap: 8,
    fontSize: 13, color: MUTED, padding: '4px 0', lineHeight: 1.6,
  },
  examSteps: {
    display: 'flex', flexDirection: 'column', gap: 12,
    marginTop: 20, marginBottom: 20,
  },
  examStep: {
    display: 'flex', alignItems: 'flex-start', gap: 16,
    fontSize: 14, color: TEXT, lineHeight: 1.6,
  },
  examNum: {
    width: 28, height: 28, borderRadius: '50%', background: PRIMARY,
    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 700, fontSize: 13, flexShrink: 0,
  },
  faxBanner: {
    display: 'flex', alignItems: 'center', gap: 10,
    background: '#eaf6ff', border: `1px solid ${PRIMARY}`,
    borderRadius: 8, padding: '14px 20px', fontSize: 14, color: DARK, fontWeight: 600,
  },
  faxIcon: { color: PRIMARY, flexShrink: 0, fontSize: 16 },
  cardGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 20, marginTop: 24,
  },
  pkgCard: {
    background: CARD_BG, border: `1px solid ${BORDER}`,
    borderTop: `4px solid ${PRIMARY}`, borderRadius: 12,
    padding: '24px', display: 'flex', flexDirection: 'column',
    gap: 12, boxShadow: CARD_SHADOW,
  },
  pkgName: { fontSize: 17, fontWeight: 700, color: DARK, margin: 0 },
  pkgMeta: { display: 'flex', alignItems: 'center', gap: 6 },
  pkgMetaIcon: { color: PRIMARY, fontSize: 13 },
  pkgHours: { fontSize: 13, color: PRIMARY, fontWeight: 600 },
  pkgCourses: {
    listStyle: 'none', padding: 0, margin: 0,
    display: 'flex', flexDirection: 'column', gap: 8, flexGrow: 1,
  },
  pkgCourseItem: {
    display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: TEXT,
  },
  pkgFooter: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderTop: `1px solid ${BORDER}`, paddingTop: 16, marginTop: 4,
  },
  pkgPrice: { fontSize: 28, fontWeight: 700, color: DARK },
  courseCard: {
    background: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: 12,
    padding: '24px', display: 'flex', flexDirection: 'column',
    gap: 12, boxShadow: CARD_SHADOW,
  },
  courseTypeTag: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    fontSize: 11, fontWeight: 700, color: PRIMARY, letterSpacing: '0.08em',
    textTransform: 'uppercase', background: '#eaf6ff',
    padding: '4px 10px', borderRadius: 20, width: 'fit-content',
  },
  courseTypeIcon: { fontSize: 11 },
  courseName: { fontSize: 17, fontWeight: 700, color: DARK, margin: 0, lineHeight: 1.3 },
  courseDesc: { fontSize: 13, color: MUTED, margin: 0, lineHeight: 1.6, flexGrow: 1 },
  courseMeta: { display: 'flex', alignItems: 'center', gap: 6 },
  courseMetaIcon: { color: PRIMARY, fontSize: 13 },
  courseHours: { fontSize: 13, color: PRIMARY, fontWeight: 600 },
  textbookLabel: {
    display: 'flex', alignItems: 'center', gap: 8, fontSize: 13,
    color: TEXT, cursor: 'pointer', background: '#f4f8fb',
    border: `1px solid ${BORDER}`, borderRadius: 6, padding: '8px 12px',
  },
  checkbox: { accentColor: PRIMARY, width: 15, height: 15, cursor: 'pointer' },
  textbookPrice: { color: PRIMARY },
  courseFooter: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    borderTop: `1px solid ${BORDER}`, paddingTop: 16,
  },
  coursePrice: { fontSize: 28, fontWeight: 700, color: DARK },

  // ── Cart buttons ──
  cartBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: DARK, color: '#fff', border: 'none',
    borderRadius: 8, padding: '10px 18px', fontSize: 13,
    fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em',
    transition: 'background 0.18s',
  },
  cartBtnAdded: {
    display: 'flex', alignItems: 'center', gap: 8,
    background: GREEN, color: '#fff', border: 'none',
    borderRadius: 8, padding: '10px 18px', fontSize: 13,
    fontWeight: 700, cursor: 'pointer', letterSpacing: '0.05em',
    transition: 'background 0.18s',
  },
};

export default InsuranceStatePage;