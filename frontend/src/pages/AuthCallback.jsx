<<<<<<< HEAD
=======
// frontend/src/pages/AuthCallback.jsx
>>>>>>> feat/matt
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthCallback = ({ onLogin }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (!token) { navigate('/'); return; }

    localStorage.setItem('token', token);

    onLogin({
      id:        params.get('userId'),
      firstName: params.get('firstName'),
      lastName:  params.get('lastName'),
      email:     params.get('email'),
      role:      params.get('role'),
      studentId: params.get('studentId') || null,
    });

<<<<<<< HEAD
    navigate('/');  // ← change to '/' or wherever your home is
=======
    navigate('/');
>>>>>>> feat/matt
  }, []);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <p>Signing you in...</p>
    </div>
  );
};

export default AuthCallback;