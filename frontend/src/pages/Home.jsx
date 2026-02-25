import { Link } from 'react-router-dom';
import { FaClock, FaUserGraduate, FaChalkboardTeacher, FaBook, FaCheckCircle, FaStar, FaDollarSign } from 'react-icons/fa';
import InsuranceStatesDropdown from '../components/common/InsuranceStatesDropdown';
import '../styles/pages/Home.css';

import heroBg from '../assets/images/slide1.jpg';

const mainServices = [
  {
    icon: <FaClock />,
    title: '45 Hour DRE Renewal CE',
    description: 'Complete your continuing education to renew your license',
    link: '/real-estate',
  },
  {
    icon: <FaUserGraduate />,
    title: 'Become an Agent',
    description: 'Get your California Real Estate Sales License',
    link: '/real-estate',
  },
  {
    icon: <FaChalkboardTeacher />,
    title: 'Become a Broker',
    description: 'Advance your career with a Broker License',
    link: '/real-estate',
  },
  {
    icon: <FaBook />,
    title: 'Sales Agent Exam Prep',
    description: 'Prepare for your state exam with confidence',
    link: '/exam-prep',
  },
];

const testimonials = [
  {
    name: 'John N.',
    role: 'Future DRE Sales Agent',
    text: 'I liked the ease of the course and having all the required information at your fingertips at anytime — online and books.',
    course: 'Sales Agent Licensing Package'
  },
  {
    name: 'Sarah M.',
    role: 'DRE Broker',
    text: 'You guys have the best course. Not only did I enjoy reading through material but I also passed the big test the very first time!',
    course: 'Broker Licensing Package'
  },
  {
    name: 'Brian G.',
    role: 'Real Estate Professional',
    text: 'I liked the videos, for me it was a better way of studying and picked up on things I either forgot or did not know.',
    course: '45-Hour CE Package'
  }
];

const whyChooseReasons = [
  { icon: <FaCheckCircle />, title: 'Competitive Pricing', description: 'Best value for quality education' },
  { icon: <FaCheckCircle />, title: 'California Specific', description: 'Tailored to CA real estate laws' },
  { icon: <FaCheckCircle />, title: 'DRE Approved', description: 'Fully accredited courses' },
  { icon: <FaCheckCircle />, title: 'Online & Books', description: 'Learn your way, anytime' }
];

const Home = () => {
  return (
    <div className="home-page">

      {/* ── HERO ── */}
      <section
        className="home-hero"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="home-hero__overlay" />
        <div className="home-hero__content">
          <p className="home-hero__tagline">Welcome to Relstone!</p>
          <h1 className="home-hero__headline">
            Providing Education Online, A Simple Way!
          </h1>
          <p className="home-hero__body">
            With real estate education that is tailored to your needs and goals, you can advance
            your career. California real estate broker and sales pre-license courses as well as
            continuing education and insurance continuing education in the majority of states.
          </p>
          <p className="home-hero__sponsor">
            REAL ESTATE LICENSE SERVICES, DRE CE Sponsor ID #1035
          </p>
          <p className="home-hero__sponsor">
            DRE Pre-License Sponsor #S0199
          </p>
          <div className="home-hero__ctas">
            <Link to="/real-estate/sales-license" className="home-hero__btn home-hero__btn--dark">
              <FaDollarSign /> Sales License
            </Link>
            <Link to="/real-estate/broker-license" className="home-hero__btn home-hero__btn--outline">
              Broker License
            </Link>
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="home-services">
        <div className="home-services__container">
          <div className="home-services__header">
            <p className="home-services__eyebrow">OUR SERVICES</p>
            <h2 className="home-services__title">To get started, choose one of the selections below</h2>
            <p className="home-services__subtitle">
              California-specific real estate and insurance education tailored to your needs and goals.
            </p>
          </div>
          <div className="home-services__grid">
            {mainServices.map((service, index) => (
              <Link key={index} to={service.link} className="service-card">
                <div className="service-card__icon">{service.icon}</div>
                <h3 className="service-card__title">{service.title}</h3>
                <p className="service-card__description">{service.description}</p>
                <span className="service-card__button">Get Started</span>
              </Link>
            ))}
            {/* Insurance CE — opens state selector panel */}
            <InsuranceStatesDropdown />
          </div>
        </div>
      </section>

      {/* ── GUARANTEE ── */}
      <section className="home-guarantee">
        <div className="home-guarantee__container">
          <div className="home-guarantee__card">
            <div className="home-guarantee__icon"><FaCheckCircle /></div>
            <div className="home-guarantee__content">
              <h3 className="home-guarantee__title">Our 100% Money-back Guarantee</h3>
              <p className="home-guarantee__text">
                Your enrollment in our <strong>Relstone</strong> homestudy courses poses no risk to you.
                If you find you are dissatisfied with your courses at any time during your one-year enrollment
                and <strong>prior to taking any exams</strong>, call us to receive a full refund of every penny
                paid to us, no questions asked — and the books and materials are yours to keep.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="home-why-choose">
        <div className="home-why-choose__container">
          <h2 className="home-why-choose__title">Why Choose Relstone?</h2>
          <div className="home-why-choose__grid">
            {whyChooseReasons.map((reason, index) => (
              <div key={index} className="reason-card">
                <div className="reason-card__icon">{reason.icon}</div>
                <h4 className="reason-card__title">{reason.title}</h4>
                <p className="reason-card__description">{reason.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="home-testimonials">
        <div className="home-testimonials__container">
          <h2 className="home-testimonials__title">Student Testimonials</h2>
          <div className="home-testimonials__grid">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="testimonial-card">
                <div className="testimonial-card__stars">
                  {[...Array(5)].map((_, i) => <FaStar key={i} />)}
                </div>
                <p className="testimonial-card__text">"{testimonial.text}"</p>
                <div className="testimonial-card__author">
                  <p className="testimonial-card__name">{testimonial.name}</p>
                  <p className="testimonial-card__role">{testimonial.role}</p>
                  <p className="testimonial-card__course">on {testimonial.course}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;