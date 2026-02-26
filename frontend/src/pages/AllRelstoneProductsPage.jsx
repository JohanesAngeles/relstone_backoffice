import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  FaSearch,
  FaFilter,
  FaShoppingCart,
  FaTag,
  FaChevronDown,
  FaChevronUp,
  FaTimes,
  FaBoxOpen,
  FaLayerGroup,
  FaArrowLeft,
  FaDollarSign,
} from 'react-icons/fa';
import useCart from '../context/useCart';
import '../styles/pages/AllRelstoneProductsPage.css';

// ── Dual-handle Price Range Slider ──────────────────────────────────────────
const PriceRangeSlider = ({ min, max, values, onChange }) => {
  const [dragging, setDragging] = useState(null); // 'min' | 'max' | null

  const pct = (v) => ((v - min) / (max - min)) * 100;

  const handleMouseDown = (handle) => (e) => {
    e.preventDefault();
    setDragging(handle);
  };

  const handleMouseMove = useCallback((e) => {
    if (!dragging) return;
    const track = document.getElementById('arp-price-track');
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const raw = Math.round(min + ratio * (max - min));

    if (dragging === 'min') {
      onChange([Math.min(raw, values[1] - 1), values[1]]);
    } else {
      onChange([values[0], Math.max(raw, values[0] + 1)]);
    }
  }, [dragging, min, max, values, onChange]);

  const handleMouseUp = useCallback(() => setDragging(null), []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging, handleMouseMove, handleMouseUp]);

  // Touch support
  const handleTouchMove = useCallback((e) => {
    if (!dragging) return;
    const track = document.getElementById('arp-price-track');
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const touch = e.touches[0];
    const ratio = Math.min(1, Math.max(0, (touch.clientX - rect.left) / rect.width));
    const raw = Math.round(min + ratio * (max - min));
    if (dragging === 'min') {
      onChange([Math.min(raw, values[1] - 1), values[1]]);
    } else {
      onChange([values[0], Math.max(raw, values[0] + 1)]);
    }
  }, [dragging, min, max, values, onChange]);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [dragging, handleTouchMove, handleMouseUp]);

  return (
    <div className="arp-price-slider">
      <div className="arp-price-slider__labels">
        <span className="arp-price-slider__val">${values[0]}</span>
        <span className="arp-price-slider__sep">–</span>
        <span className="arp-price-slider__val">${values[1]}</span>
      </div>
      <div className="arp-price-slider__track-wrap">
        <div className="arp-price-slider__track" id="arp-price-track">
          {/* filled range */}
          <div
            className="arp-price-slider__fill"
            style={{ left: `${pct(values[0])}%`, width: `${pct(values[1]) - pct(values[0])}%` }}
          />
          {/* min thumb */}
          <div
            className={`arp-price-slider__thumb${dragging === 'min' ? ' arp-price-slider__thumb--active' : ''}`}
            style={{ left: `${pct(values[0])}%` }}
            onMouseDown={handleMouseDown('min')}
            onTouchStart={handleMouseDown('min')}
            role="slider"
            aria-valuemin={min}
            aria-valuemax={values[1]}
            aria-valuenow={values[0]}
          />
          {/* max thumb */}
          <div
            className={`arp-price-slider__thumb${dragging === 'max' ? ' arp-price-slider__thumb--active' : ''}`}
            style={{ left: `${pct(values[1])}%` }}
            onMouseDown={handleMouseDown('max')}
            onTouchStart={handleMouseDown('max')}
            role="slider"
            aria-valuemin={values[0]}
            aria-valuemax={max}
            aria-valuenow={values[1]}
          />
        </div>
      </div>
      <div className="arp-price-slider__bounds">
        <span>${min}</span>
        <span>${max}</span>
      </div>
    </div>
  );
};

// ── Single Product Card ──────────────────────────────────────────────────────
const ProductCard = ({ item, type, stateName, onAddToCart, inCart }) => {
  const [textbookChecked, setTextbookChecked] = useState(false);

  const handleAdd = () => {
    onAddToCart({
      id: item._id,
      name: item.name,
      type,
      stateName,
      price: item.price,
      creditHours: item.creditHours || item.totalHours || 0,
      stateSlug: item.stateSlug,
      textbookPrice: item.printedTextbookPrice || 0,
      withTextbook: textbookChecked,
    });
  };

  return (
    <div className={`arp-card${inCart ? ' arp-card--in-cart' : ''}`}>
      <div className="arp-card__top">
        <div className="arp-card__meta">
          <span className={`arp-card__badge arp-card__badge--${type}`}>
            {type === 'package' ? <><FaLayerGroup /> Package</> : <><FaBoxOpen /> Course</>}
          </span>
          {item.courseType && (
            <span className={`arp-card__type arp-card__type--${item.courseType.toLowerCase()}`}>
              {item.courseType}
            </span>
          )}
        </div>
        <span className="arp-card__price">${item.price.toFixed(2)}</span>
      </div>

      <h3 className="arp-card__name">{item.name}</h3>

      {(item.creditHours || item.totalHours) > 0 && (
        <p className="arp-card__hours">
          <FaTag className="arp-card__hours-icon" />
          {item.creditHours || item.totalHours} Credit Hours
        </p>
      )}

      {type === 'package' && item.coursesIncluded?.length > 0 && (
        <ul className="arp-card__includes">
          {item.coursesIncluded.map((c, i) => (
            <li key={i} className="arp-card__includes-item">✓ {c}</li>
          ))}
        </ul>
      )}

      {type === 'course' && item.hasPrintedTextbook && item.printedTextbookPrice > 0 && (
        <label className="arp-card__textbook">
          <input
            type="checkbox"
            checked={textbookChecked}
            onChange={e => setTextbookChecked(e.target.checked)}
          />
          <span>Add Printed Textbook <strong>+${item.printedTextbookPrice.toFixed(2)}</strong></span>
        </label>
      )}

      <button
        className={`arp-card__btn${inCart ? ' arp-card__btn--added' : ''}`}
        onClick={handleAdd}
        disabled={inCart}
      >
        {inCart ? '✓ In Cart' : <><FaShoppingCart /> Add to Cart</>}
      </button>
    </div>
  );
};

// ── State Section ────────────────────────────────────────────────────────────
const StateSection = ({ stateName, stateSlug, courses, packages, onAddToCart, cartIds, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen || false);
  const totalProducts = courses.length + packages.length;

  return (
    <div className="arp-state">
      <button className="arp-state__header" onClick={() => setOpen(o => !o)}>
        <div className="arp-state__header-left">
          <span className="arp-state__name">{stateName}</span>
          <span className="arp-state__count">{totalProducts} product{totalProducts !== 1 ? 's' : ''}</span>
        </div>
        <span className="arp-state__chevron">{open ? <FaChevronUp /> : <FaChevronDown />}</span>
      </button>

      {open && (
        <div className="arp-state__body">
          {packages.length > 0 && (
            <div className="arp-state__group">
              <h4 className="arp-state__group-title"><FaLayerGroup /> Packages</h4>
              <div className="arp-cards-grid">
                {packages.map(pkg => (
                  <ProductCard
                    key={pkg._id}
                    item={pkg}
                    type="package"
                    stateName={stateName}
                    onAddToCart={onAddToCart}
                    inCart={cartIds.has(pkg._id)}
                  />
                ))}
              </div>
            </div>
          )}

          {courses.length > 0 && (
            <div className="arp-state__group">
              <h4 className="arp-state__group-title"><FaBoxOpen /> Individual Courses</h4>
              <div className="arp-cards-grid">
                {courses.map(course => (
                  <ProductCard
                    key={course._id}
                    item={course}
                    type="course"
                    stateName={stateName}
                    onAddToCart={onAddToCart}
                    inCart={cartIds.has(course._id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const AllRelstoneProductsPage = () => {
  const { cartItems, addToCart } = useCart();
  const cartIds = useMemo(() => new Set(cartItems.map(i => i.id)), [cartItems]);

  const [allData, setAllData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedState, setSelectedState] = useState('all');
  const [priceRange, setPriceRange] = useState([0, 300]); // will be updated after data loads
  const [globalPriceBounds, setGlobalPriceBounds] = useState([0, 300]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        const statesRes = await fetch('/api/insurance/states');
        const statesJson = await statesRes.json();
        if (!statesJson.success) throw new Error('Failed to load states');

        const fullDataArr = await Promise.all(
          statesJson.data.map(async (s) => {
            const r = await fetch(`/api/insurance/${s.slug}/full`);
            const j = await r.json();
            return j.success ? j.data : null;
          })
        );

        const data = fullDataArr.filter(Boolean);
        setAllData(data);

        // Compute global price bounds from all products
        const allPrices = data.flatMap(d => [
          ...d.courses.map(c => c.price),
          ...d.packages.map(p => p.price),
        ]);
        if (allPrices.length) {
          const minP = Math.floor(Math.min(...allPrices));
          const maxP = Math.ceil(Math.max(...allPrices));
          setGlobalPriceBounds([minP, maxP]);
          setPriceRange([minP, maxP]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const isPriceFiltered =
    priceRange[0] > globalPriceBounds[0] || priceRange[1] < globalPriceBounds[1];

  const filtered = useMemo(() => {
    return allData
      .filter(d => selectedState === 'all' || d.state.slug === selectedState)
      .map(d => {
        const q = search.toLowerCase();

        const courses = d.courses.filter(c => {
          const matchSearch = !q || c.name.toLowerCase().includes(q);
          const matchType = filterType === 'all' || filterType === 'course';
          const matchCat = filterCategory === 'all' || c.courseType === filterCategory;
          const matchPrice = c.price >= priceRange[0] && c.price <= priceRange[1];
          return matchSearch && matchType && matchCat && matchPrice;
        });

        const packages = d.packages.filter(p => {
          const matchSearch = !q || p.name.toLowerCase().includes(q);
          const matchType = filterType === 'all' || filterType === 'package';
          const matchPrice = p.price >= priceRange[0] && p.price <= priceRange[1];
          return matchSearch && matchType && matchPrice;
        });

        return { ...d, courses, packages };
      })
      .filter(d => d.courses.length + d.packages.length > 0);
  }, [allData, search, filterType, filterCategory, selectedState, priceRange]);

  const totalProducts = filtered.reduce((s, d) => s + d.courses.length + d.packages.length, 0);

  const clearFilters = () => {
    setSearch('');
    setFilterType('all');
    setFilterCategory('all');
    setSelectedState('all');
    setPriceRange([...globalPriceBounds]);
  };

  const hasFilters = search || filterType !== 'all' || filterCategory !== 'all'
    || selectedState !== 'all' || isPriceFiltered;

  return (
    <div className="arp-page">

      {/* ── Header ── */}
      <div className="arp-header">
        <div className="arp-container">
          <div className="arp-header__inner">
            <div>
              <h1 className="arp-header__title">All Relstone Products</h1>
              <p className="arp-header__sub">
                Browse our complete catalog of insurance CE courses and packages across all states.
              </p>
            </div>
            {/* <Link to="/" className="arp-header__back">
              <FaArrowLeft /> Back to Home
            </Link> */}
          </div>
        </div>
      </div>

      <div className="arp-container">

        {/* ── Filter Bar ── */}
        <div className="arp-filters">

          {/* Row 1: Search + State + Type + Category */}
          <div className="arp-filters__row">
            {/* Search */}
            <div className="arp-search">
              <FaSearch className="arp-search__icon" />
              <input
                type="text"
                placeholder="Search courses and packages..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="arp-search__input"
              />
              {search && (
                <button className="arp-search__clear" onClick={() => setSearch('')}>
                  <FaTimes />
                </button>
              )}
            </div>

            {/* State */}
            <div className="arp-filter-group">
              <label className="arp-filter-group__label"><FaFilter /> State</label>
              <select
                value={selectedState}
                onChange={e => setSelectedState(e.target.value)}
                className="arp-filter-group__select"
              >
                <option value="all">All States</option>
                {allData.map(d => (
                  <option key={d.state.slug} value={d.state.slug}>{d.state.name}</option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div className="arp-filter-group">
              <label className="arp-filter-group__label">Type</label>
              <div className="arp-toggle-group">
                {['all','course','package'].map(t => (
                  <button
                    key={t}
                    className={`arp-toggle${filterType === t ? ' arp-toggle--active' : ''}`}
                    onClick={() => setFilterType(t)}
                  >
                    {t === 'all' ? 'All' : t === 'course' ? 'Courses' : 'Packages'}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div className="arp-filter-group">
              <label className="arp-filter-group__label">Category</label>
              <div className="arp-toggle-group">
                {['all','General','Ethics'].map(c => (
                  <button
                    key={c}
                    className={`arp-toggle${filterCategory === c ? ' arp-toggle--active' : ''}`}
                    onClick={() => setFilterCategory(c)}
                  >
                    {c === 'all' ? 'All' : c}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Row 2: Price Range */}
          <div className="arp-filters__price-row">
            <div className="arp-filter-group arp-filter-group--price">
              <label className="arp-filter-group__label">
                <FaDollarSign /> Price Range
                {isPriceFiltered && (
                  <span className="arp-price-active-badge">${priceRange[0]} – ${priceRange[1]}</span>
                )}
              </label>
              {!loading && globalPriceBounds[1] > globalPriceBounds[0] && (
                <PriceRangeSlider
                  min={globalPriceBounds[0]}
                  max={globalPriceBounds[1]}
                  values={priceRange}
                  onChange={setPriceRange}
                />
              )}
            </div>

            {hasFilters && (
              <button className="arp-clear-filters" onClick={clearFilters}>
                <FaTimes /> Clear All Filters
              </button>
            )}
          </div>

        </div>

        {/* ── Results meta ── */}
        {!loading && !error && (
          <p className="arp-results-meta">
            Showing <strong>{totalProducts}</strong> product{totalProducts !== 1 ? 's' : ''}
            {' '}across <strong>{filtered.length}</strong> state{filtered.length !== 1 ? 's' : ''}
            {hasFilters && <span className="arp-results-meta__filtered"> (filtered)</span>}
          </p>
        )}

        {/* ── Loading ── */}
        {loading && (
          <div className="arp-loading">
            <div className="arp-loading__spinner" />
            <p>Loading all products…</p>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="arp-error">
            <p>⚠️ Failed to load products: {error}</p>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </div>
        )}

        {/* ── Empty ── */}
        {!loading && !error && filtered.length === 0 && (
          <div className="arp-empty">
            <FaSearch className="arp-empty__icon" />
            <h3>No products found</h3>
            <p>Try adjusting your search or filters.</p>
            <button className="arp-empty__btn" onClick={clearFilters}>Clear All Filters</button>
          </div>
        )}

        {/* ── State sections ── */}
        {!loading && !error && (
          <div className="arp-states-list">
            {filtered.map((d, i) => (
              <StateSection
                key={d.state.slug}
                stateName={d.state.name}
                stateSlug={d.state.slug}
                courses={d.courses}
                packages={d.packages}
                onAddToCart={addToCart}
                cartIds={cartIds}
                defaultOpen={i === 0 || hasFilters}
              />
            ))}
          </div>
        )}

        {/* ── Sticky cart CTA ── */}
        {/* {cartItems.length > 0 && (
          <div className="arp-cart-cta">
            <span>{cartItems.length} item{cartItems.length !== 1 ? 's' : ''} in cart</span>
            <Link to="/cart" className="arp-cart-cta__btn">
              <FaShoppingCart /> View Cart
            </Link>
          </div>
        )} */}

      </div>
    </div>
  );
};

export default AllRelstoneProductsPage;