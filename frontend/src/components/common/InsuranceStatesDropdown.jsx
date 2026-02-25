import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCertificate, FaChevronDown } from 'react-icons/fa';
import '../../styles/components/InsuranceStatesDropdown.css';

const STATES = [
  'Alabama', 'Arizona', 'Arkansas', 'California', 'Colorado',
  'Connecticut', 'Delaware', 'District of Columbia', 'Florida', 'Georgia',
  'Hawaii', 'Idaho', 'Indiana', 'Iowa', 'Kansas',
  'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Michigan',
  'Mississippi', 'Missouri', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
  'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah',
  'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const InsuranceStatesDropdown = () => {
  const [open, setOpen] = useState(false);
  const cardRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        cardRef.current && !cardRef.current.contains(e.target) &&
        panelRef.current && !panelRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      {/* Card — same look as other service cards */}
      <div
        ref={cardRef}
        className={`service-card ins-card${open ? ' ins-card--active' : ''}`}
        onClick={() => setOpen((v) => !v)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setOpen((v) => !v)}
      >
        <div className="service-card__icon"><FaCertificate /></div>
        <h3 className="service-card__title">Insurance CE</h3>
        <p className="service-card__description">
          Renew your insurance license in multiple states
        </p>
        <span className="service-card__button ins-card__button">
          Select a State
          <FaChevronDown className={`ins-card__chevron${open ? ' ins-card__chevron--open' : ''}`} />
        </span>
      </div>

      {/* Full-width fixed panel */}
      {open && (
        <div ref={panelRef} className="ins-panel">
          <div className="ins-panel__inner">
            <div className="ins-panel__header">
              <p className="ins-panel__label">Select your state to continue:</p>
              <button className="ins-panel__close" onClick={() => setOpen(false)}>✕</button>
            </div>
            <div className="ins-panel__grid">
              {STATES.map((state) => (
                <Link
                  key={state}
                  to={`/insurance/${state.toLowerCase().replace(/\s+/g, '-')}`}
                  className="ins-panel__pill"
                  onClick={() => setOpen(false)}
                >
                  {state}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InsuranceStatesDropdown;