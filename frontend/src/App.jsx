// frontend/src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import Home from './pages/Home';
import InsuranceStatePage from './pages/InsuranceStatePage';
import InsuranceRenewPage from './pages/InsuranceRenewPage';
import ScrollToTop from './components/common/ScrollToTop';
import InsuranceFAQPage from './pages/Insurancefaqpage';
import CFPRenewPage from './pages/CFPRenewPage';
import AboutPage from './pages/Aboutpage';
import CartProvider from './context/Cartprovider';
import CartPage from './pages/CartPage';
import ProceedToCheckoutPage from './pages/ProceedToCheckoutPage';
import AllRelstoneProductsPage from './pages/AllRelstoneProductsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ContactUsPage from './pages/ContactUsPage';
import RefundPolicyPage from './pages/RefundPolicyPage';
import AuthCallback from './pages/AuthCallback';
import MyCourses from './pages/MyCourses';
import BundleOverviewPage from './pages/BundleOverviewPage';
import ExamPortalPage from './pages/ExamPortalPage';
import ExamResultsPage from './pages/ExamResultsPage';
<<<<<<< HEAD
=======
import ProfilePage from './pages/ProfilePage';
>>>>>>> feat/matt-clean

// ── Shared layout wrapper (has Header + Footer) ───────────────────────────────
const MainLayout = ({ user, onLogin, onLogout, children }) => (
  <div className="flex flex-col min-h-screen">
    <Header user={user} onLogin={onLogin} onLogout={onLogout} />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

function App() {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const layoutProps = { user, onLogin: handleLogin, onLogout: handleLogout };

  return (
    <Router>
      <CartProvider>
        <ScrollToTop />
        <Routes>

          {/* ── Auth callback (no header needed, handles redirect) ── */}
          <Route
            path="/auth/callback"
            element={<AuthCallback onLogin={handleLogin} />}
          />

          {/* ── Student portal (no public header/footer) ── */}
          <Route path="/my-courses"               element={<MyCourses />} />
          <Route path="/bundle/:bundleId"         element={<BundleOverviewPage />} />
          <Route path="/exam/:bundleId/:examName" element={<ExamPortalPage />} />
          <Route path="/exam-results/:sessionId"  element={<ExamResultsPage />} />

          {/* ── All public pages with Header + Footer ── */}
          <Route path="/"               element={<MainLayout {...layoutProps}><Home /></MainLayout>} />
          <Route path="/insurance/renew" element={<MainLayout {...layoutProps}><InsuranceRenewPage /></MainLayout>} />
          <Route path="/insurance/faq"  element={<MainLayout {...layoutProps}><InsuranceFAQPage /></MainLayout>} />
          <Route path="/insurance/:slug" element={<MainLayout {...layoutProps}><InsuranceStatePage /></MainLayout>} />
          <Route path="/cfp-renewal"    element={<MainLayout {...layoutProps}><CFPRenewPage /></MainLayout>} />
          <Route path="/about"          element={<MainLayout {...layoutProps}><AboutPage /></MainLayout>} />
          <Route path="/cart"           element={<MainLayout {...layoutProps}><CartPage /></MainLayout>} />
          <Route path="/checkout"       element={<MainLayout {...layoutProps}><ProceedToCheckoutPage /></MainLayout>} />
          <Route path="/products"       element={<MainLayout {...layoutProps}><AllRelstoneProductsPage /></MainLayout>} />
          <Route path="/privacy-policy" element={<MainLayout {...layoutProps}><PrivacyPolicyPage /></MainLayout>} />
          <Route path="/contact"        element={<MainLayout {...layoutProps}><ContactUsPage /></MainLayout>} />
          <Route path="/refund-policy"  element={<MainLayout {...layoutProps}><RefundPolicyPage /></MainLayout>} />
<<<<<<< HEAD
=======
          <Route path="/profile" element={<MainLayout {...layoutProps}><ProfilePage /></MainLayout>} />
>>>>>>> feat/matt-clean

        </Routes>
      </CartProvider>
    </Router>
  );
}

export default App;