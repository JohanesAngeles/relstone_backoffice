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

function App() {
  return (
    <Router>
      <CartProvider>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/insurance/renew" element={<InsuranceRenewPage />} />
              <Route path="/insurance/faq" element={<InsuranceFAQPage />} />
              <Route path="/insurance/:slug" element={<InsuranceStatePage />} />
              <Route path="/cfp-renewal" element={<CFPRenewPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<ProceedToCheckoutPage />} />
              <Route path="/products" element={<AllRelstoneProductsPage />} /> 
              <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
              <Route path="/contact" element={<ContactUsPage />} />
              <Route path="/refund-policy" element={<RefundPolicyPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;