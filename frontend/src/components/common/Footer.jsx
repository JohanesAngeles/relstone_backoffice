import { Link } from 'react-router-dom';
import { FaFacebookF, FaXTwitter, FaInstagram } from 'react-icons/fa6';
import RelStoneLogo from '../../assets/images/Left Side Logo.png';

const Footer = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>

        {/* Top Section */}
        <div style={styles.top}>

          {/* Brand */}
          <div style={styles.brand}>
            <img src={RelStoneLogo} alt="Relstone" style={styles.logo} />
            <p style={styles.tagline}>
              Providing quality education for California Real Estate and Insurance professionals.
            </p>
            <div style={styles.socials}>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" style={styles.socialBtn}>
                <FaFacebookF size={14} />
              </a>
              <a href="https://x.com" target="_blank" rel="noreferrer" style={styles.socialBtn}>
                <FaXTwitter size={14} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" style={styles.socialBtn}>
                <FaInstagram size={14} />
              </a>
            </div>
          </div>

          {/* Courses */}
          <div style={styles.col}>
            <h4 style={styles.colTitle}>Courses</h4>
            <ul style={styles.list}>
              <li><Link to="/exam-prep" style={styles.link}>Exam Prep</Link></li>
              <li><Link to="/real-estate/san-diego" style={styles.link}>CA Real Estate License School</Link></li>
              <li><Link to="/real-estate/general" style={styles.link}>Real Estate General Information</Link></li>
              <li><Link to="/real-estate/grading" style={styles.link}>Grading & Issuing Certificates</Link></li>
              <li><Link to="/student-instruction" style={styles.link}>Student Instruction</Link></li>
            </ul>
          </div>

          {/* Products */}
          <div style={styles.col}>
            <h4 style={styles.colTitle}>Products</h4>
            <ul style={styles.list}>
              <li><Link to="/products" style={styles.link}>All Relstone Products</Link></li>
              <li><Link to="/general-information" style={styles.link}>General Information</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div style={styles.col}>
            <h4 style={styles.colTitle}>Company</h4>
            <ul style={styles.list}>
              <li><Link to="/contact" style={styles.link}>Contact Us</Link></li>
              <li><Link to="/locations" style={styles.link}>Locations</Link></li>
              <li><Link to="/real-estate/license-school" style={styles.link}>License School</Link></li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div style={styles.divider} />

        {/* Bottom */}
        <div style={styles.bottom}>
          <p style={styles.copyright}>© 2026 Relstone. All rights reserved.</p>
          <div style={styles.bottomLinks}>
            <Link to="/privacy" style={styles.smallLink}>Privacy Policy</Link>
            <Link to="/terms" style={styles.smallLink}>Terms of Use</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

const styles = {
  footer: {
    backgroundColor: '#0f1117',
    color: '#fff',
    fontFamily: "'Poppins', sans-serif",
    padding: '64px 0 32px',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 32px',
  },
  top: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr 1fr',
    gap: '48px',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  logo: {
    height: '48px',
    width: 'auto',
    objectFit: 'contain',
    filter: 'brightness(0) invert(1)',
  },
  tagline: {
    fontSize: '14px',
    color: '#9ca3af',
    lineHeight: '1.7',
    maxWidth: '260px',
    margin: 0,
  },
  socials: {
    display: 'flex',
    gap: '10px',
    marginTop: '4px',
  },
  socialBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    backgroundColor: '#1e2230',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
    transition: 'background 0.2s, color 0.2s',
    textDecoration: 'none',
  },
  col: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  colTitle: {
    fontSize: '13px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: '#ffffff',
    margin: 0,
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  link: {
    fontSize: '14px',
    color: '#9ca3af',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
  divider: {
    height: '1px',
    backgroundColor: '#1e2230',
    margin: '48px 0 24px',
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  },
  copyright: {
    fontSize: '13px',
    color: '#6b7280',
    margin: 0,
  },
  bottomLinks: {
    display: 'flex',
    gap: '24px',
  },
  smallLink: {
    fontSize: '13px',
    color: '#6b7280',
    textDecoration: 'none',
    transition: 'color 0.2s',
  },
};

export default Footer;