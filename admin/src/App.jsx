import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './context/AuthProvider';
import ProtectedRoute  from './routes/ProtectedRoute';
import AdminHome       from './pages/AdminHome';
import AdminLogin      from './pages/auth/AdminLogin';
import AdminCaptcha    from './pages/auth/AdminCaptcha';

import RealEstate    from './pages/real_estate/RealEstate';
import StudentDetail from './pages/real_estate/StudentDetail';

import BackOffice from './pages/real_estate/BackOffice';
import TranscriptPage from './pages/real_estate/Transcriptpage';

import ExamData from './pages/exam_data/ExamData';


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

          <Route path="/admin/real-estate" element={
            <ProtectedRoute>
              <RealEstate />
            </ProtectedRoute>
          } />

          <Route path="/admin/students/:id" element={
            <ProtectedRoute>
              <StudentDetail />
            </ProtectedRoute>
          } />

          <Route path="/admin/real-estate/online-exam/backoffice" element={
            <ProtectedRoute><BackOffice /></ProtectedRoute>
          } />

          {/* Add more protected routes here */}
          <Route path="/admin/transcript/:studentId/:courseIndex" element={<TranscriptPage />} />
          
          <Route path="/admin/exam-data" element={
            <ProtectedRoute><ExamData /></ProtectedRoute>
          } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;