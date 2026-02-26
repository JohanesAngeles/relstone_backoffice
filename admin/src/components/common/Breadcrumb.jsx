import { Link } from 'react-router-dom';

/**
 * Breadcrumb — reusable across all admin pages
 *
 * Usage:
 *   import Breadcrumb from '../../components/common/Breadcrumb';
 *
 *   <Breadcrumb crumbs={[
 *     { label: 'Dashboard', to: '/admin' },
 *     { label: 'Real Estate', to: '/admin/real-estate' },
 *     { label: 'BackOffice' },   // ← last item has no `to` (current page)
 *   ]} />
 */

const Breadcrumb = ({ crumbs = [] }) => {
  return (
    <nav style={S.nav} aria-label="breadcrumb">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} style={S.item}>
            {!isLast && crumb.to ? (
              <Link to={crumb.to} style={S.link}>
                {crumb.label}
              </Link>
            ) : (
              <span style={isLast ? S.current : S.link}>
                {crumb.label}
              </span>
            )}
            {!isLast && <span style={S.separator}>›</span>}
          </span>
        );
      })}
    </nav>
  );
};

const S = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 0,
    marginBottom: '1.25rem',
    fontSize: '0.8rem',
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 0,
  },
  link: {
    color: '#2563eb',
    textDecoration: 'none',
    fontWeight: 500,
    padding: '0 2px',
    borderRadius: 4,
    transition: 'color 0.15s',
  },
  separator: {
    color: '#94a3b8',
    margin: '0 6px',
    fontSize: '0.85rem',
    userSelect: 'none',
  },
  current: {
    color: '#374151',
    fontWeight: 600,
    padding: '0 2px',
  },
};

export default Breadcrumb;