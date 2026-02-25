import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './context/AuthProvider';
import ProtectedRoute  from './routes/ProtectedRoute';
import AdminHome       from './pages/AdminHome';
import AdminLogin      from './pages/auth/AdminLogin';
import AdminCaptcha    from './pages/auth/AdminCaptcha';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Default redirect to login */}
          <Route path="/" element={<Navigate to="/admin/login" replace />} />

          {/* Auth flow — public */}
          <Route path="/admin/login"   element={<AdminLogin />} />
          <Route path="/admin/captcha" element={<AdminCaptcha />} />

          {/* Protected — requires valid admin token */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminHome />
            </ProtectedRoute>
          } />

          {/* Add more protected routes here */}
          {/* <Route path="/admin/email-lookups" element={
            <ProtectedRoute>
              <EmailLookups />
            </ProtectedRoute>
          } /> */}

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;