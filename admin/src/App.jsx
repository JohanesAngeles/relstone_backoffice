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
import CertificatePage from './pages/real_estate/CertificatePage';
import CECCoursesPage from './pages/cec_courses/CECCoursesPage';
import CECBackOffice from './pages/cec_courses/CECBackOffice';

import CECStudentDetail from './pages/cec_courses/CECStudentDetail';
import CECCertificatePage from './pages/cec_courses/CECCertificatePage';

import SecureOrders from './pages/real_estate/SecureOrders';
import AddStudent from './pages/real_estate/AddStudent';
import AddExamPage from './pages/real_estate/AddExamPage';



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

          <Route path="/admin/certificate/:studentId/:courseIndex" element={<CertificatePage />} />

          <Route path="/admin/cec-courses" element={<CECCoursesPage />} />

          <Route path="/admin/cec-courses/online-exam/backoffice" element={<CECBackOffice />} />

          <Route path="/admin/cec-students/:id" element={<CECStudentDetail />} />

          <Route path="/admin/cec-certificate/:studentId/:courseIndex" element={<CECCertificatePage />} />

          <Route path="/admin/real-estate/secure-orders" element={<SecureOrders />} />

          <Route path="/admin/real-estate/online-exam/backoffice/add-student" element={<AddStudent />} />

          <Route path="/admin/real-estate/online-exam/backoffice/student/:id/add-exam" element={<AddExamPage />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;