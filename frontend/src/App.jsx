import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import CoursePage from './pages/CoursePage';



// ── Student Portal / Dashboard pages (use DashboardLayout, NOT the global Header/Footer)
import MyCourses from './pages/MyCourses';
// import MyProfile from './pages/MyProfile';       // add later
// import CourseDetail from './pages/CourseDetail'; // add later

import BundleOverviewPage from './pages/BundleOverviewPage';
import ExamPortalPage     from './pages/ExamPortalPage';
import ExamResultsPage    from './pages/ExamResultsPage';  // ← next step

function App() {
  return (
    <Router>
      <CartProvider>
        <ScrollToTop />
        <Routes>

          {/* ── Public pages — use the global Header + Footer ── */}
          <Route
            path="/*"
            element={
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/"                element={<Home />} />
                    <Route path="/insurance/renew" element={<InsuranceRenewPage />} />
                    <Route path="/insurance/faq"   element={<InsuranceFAQPage />} />
                    <Route path="/insurance/:slug" element={<InsuranceStatePage />} />
                    <Route path="/cfp-renewal"     element={<CFPRenewPage />} />
                    <Route path="/about"           element={<AboutPage />} />
                    <Route path="/cart"            element={<CartPage />} />
                    <Route path="/checkout"        element={<ProceedToCheckoutPage />} />
                    <Route path="/products"        element={<AllRelstoneProductsPage />} />
                    <Route path="/privacy-policy"  element={<PrivacyPolicyPage />} />
                    <Route path="/contact"         element={<ContactUsPage />} />
                    <Route path="/refund-policy"   element={<RefundPolicyPage />} />
                    
                  </Routes>
                </main>
                <Footer />
              </div>
            }
          />

          {/* ── Student Portal / Dashboard pages — DashboardLayout handles its own Header/Footer ── */}
          <Route path="/my-courses"    element={<MyCourses />} />
          {/* <Route path="/profile"       element={<MyProfile />} /> */}
          {/* <Route path="/courses/:id"   element={<CourseDetail />} /> */}


            <Route path="/bundle/:bundleId" element={<BundleOverviewPage />} />
            <Route path="/exam/:bundleId/:examName"      element={<ExamPortalPage />} />
            <Route path="/exam-results/:sessionId"       element={<ExamResultsPage />} />
            <Route path="/course/:bundleId/:examName" element={<CoursePage />} />
        </Routes>
      </CartProvider>
    </Router>
  );
}

export default App;