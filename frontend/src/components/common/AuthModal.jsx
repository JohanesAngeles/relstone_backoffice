import { useState } from 'react';
import { FaTimes, FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from '../../assets/images/relstone_ICON.png';
import '../../styles/components/AuthModal.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ── Reusable 6-digit code input ───────────────────────────────
const CodeInputs = ({ code, setCode, prefix }) => {
  const handleChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...code];
    next[idx] = val.slice(-1);
    setCode(next);
    if (val && idx < 5) document.getElementById(`${prefix}-${idx + 1}`)?.focus();
  };
  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !code[idx] && idx > 0)
      document.getElementById(`${prefix}-${idx - 1}`)?.focus();
  };
  return (
    <div className="auth-modal__code-inputs">
      {code.map((digit, idx) => (
        <input
          key={idx}
          id={`${prefix}-${idx}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          className="auth-modal__code-box"
          value={digit}
          onChange={(e) => handleChange(e.target.value, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          autoFocus={idx === 0}
        />
      ))}
    </div>
  );
};

// ── Login Screen ──────────────────────────────────────────────
const LoginForm = ({ onLogin, onSwitchToRegister, onForgotPassword }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('All fields are required.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.needsVerification) {
          onForgotPassword(data.userId, form.email, true);
        } else {
          setError(data.message);
        }
        return;
      }
      localStorage.setItem('token', data.token);
      onLogin(data.user);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="auth-modal__title">Welcome back!</h2>
      <p className="auth-modal__subtitle">
        First time here?{' '}
        <button className="auth-modal__switch" onClick={onSwitchToRegister}>Sign up for free</button>
      </p>
      <form className="auth-modal__form" onSubmit={handleSubmit}>
        <input type="email" placeholder="Your email" className="auth-modal__input"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          autoComplete="email" />
        <div className="auth-modal__password-wrap">
          <input type={showPassword ? 'text' : 'password'} placeholder="Password"
            className="auth-modal__input auth-modal__input--password"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="current-password" />
          <button type="button" className="auth-modal__eye" onClick={() => setShowPassword(v => !v)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {error && <p className="auth-modal__error">{error}</p>}
        <button type="submit" className="auth-modal__submit" disabled={loading}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
        <button type="button" className="auth-modal__forgot"
          onClick={() => onForgotPassword(null, form.email, false)}>
          Forgot your password?
        </button>
      </form>
    </>
  );
};

// ── Register Screen ───────────────────────────────────────────
const RegisterForm = ({ onSwitchToLogin, onNeedsVerification }) => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.firstName || !form.lastName || !form.email || !form.password){ setError('All fields are required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          firstName: form.firstName, 
          lastName: form.lastName,
          email: form.email, 
          password: form.password 
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      onNeedsVerification(data.userId, form.email);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="auth-modal__title">Create your account</h2>
      <p className="auth-modal__subtitle">
        Already have an account?{' '}
        <button className="auth-modal__switch" onClick={onSwitchToLogin}>Sign in</button>
      </p>
      <form className="auth-modal__form" onSubmit={handleSubmit}>
        <div className="auth-modal__name-row">
        <input type="text" placeholder="First name" className="auth-modal__input"
            value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            autoComplete="given-name" />
        <input type="text" placeholder="Last name" className="auth-modal__input"
            value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            autoComplete="family-name" />
        </div>
        <input type="email" placeholder="Your email" className="auth-modal__input"
          value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          autoComplete="email" />
        <div className="auth-modal__password-wrap">
          <input type={showPassword ? 'text' : 'password'} placeholder="Password (min 6 characters)"
            className="auth-modal__input auth-modal__input--password"
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete="new-password" />
          <button type="button" className="auth-modal__eye" onClick={() => setShowPassword(v => !v)}>
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
        {error && <p className="auth-modal__error">{error}</p>}
        <button type="submit" className="auth-modal__submit" disabled={loading}>
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>
    </>
  );
};

// ── Verify Email Screen ───────────────────────────────────────
const VerifyForm = ({ userId, email, onLogin, onBack }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resent, setResent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < 6) { setError('Please enter the full 6-digit code.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: fullCode }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      localStorage.setItem('token', data.token);
      onLogin(data.user);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await fetch(`${API}/auth/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      setResent(true);
      setCode(['', '', '', '', '', '']);
      setTimeout(() => setResent(false), 5000);
    } catch {
      setError('Could not resend. Try again.');
    }
  };

  return (
    <>
      <h2 className="auth-modal__title">Check your email</h2>
      <p className="auth-modal__subtitle">
        We sent a 6-digit code to <strong>{email}</strong>
      </p>
      <form className="auth-modal__form" onSubmit={handleSubmit}>
        <CodeInputs code={code} setCode={setCode} prefix="vcode" />
        {error && <p className="auth-modal__error">{error}</p>}
        {resent && <p className="auth-modal__success">✓ New code sent to your email!</p>}
        <button type="submit" className="auth-modal__submit" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify Email'}
        </button>
      </form>
      <div className="auth-modal__divider"><span>or</span></div>
      <button className="auth-modal__sso" onClick={handleResend}>Resend Code</button>
      <button className="auth-modal__forgot" onClick={onBack}>← Back to Sign In</button>
    </>
  );
};

// ── Forgot / Reset Password Screen ───────────────────────────
const ForgotPasswordForm = ({ userId: initUserId, email: initEmail, onBack }) => {
  const [step, setStep] = useState(initUserId ? 'code' : 'email');
  const [userId, setUserId] = useState(initUserId || '');
  const [email, setEmail] = useState(initEmail || '');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setUserId(data.userId);
      setStep('code');
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length < 6) { setError('Enter the full 6-digit code.'); return; }
    if (newPassword.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: fullCode, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message); return; }
      setSuccess('Password reset! Redirecting to sign in...');
      setTimeout(onBack, 2000);
    } catch {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h2 className="auth-modal__title">Reset password</h2>
      {step === 'email' ? (
        <>
          <p className="auth-modal__subtitle">Enter your email and we'll send a reset code.</p>
          <form className="auth-modal__form" onSubmit={handleRequestCode}>
            <input type="email" placeholder="Your email" className="auth-modal__input"
              value={email} onChange={(e) => setEmail(e.target.value)} />
            {error && <p className="auth-modal__error">{error}</p>}
            <button type="submit" className="auth-modal__submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Code'}
            </button>
          </form>
        </>
      ) : (
        <>
          <p className="auth-modal__subtitle">
            Enter the code sent to <strong>{email}</strong> and your new password.
          </p>
          <form className="auth-modal__form" onSubmit={handleReset}>
            <CodeInputs code={code} setCode={setCode} prefix="rcode" />
            <div className="auth-modal__password-wrap">
              <input type={showPassword ? 'text' : 'password'} placeholder="New password"
                className="auth-modal__input auth-modal__input--password"
                value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <button type="button" className="auth-modal__eye" onClick={() => setShowPassword(v => !v)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            {error && <p className="auth-modal__error">{error}</p>}
            {success && <p className="auth-modal__success">{success}</p>}
            <button type="submit" className="auth-modal__submit" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        </>
      )}
      <button className="auth-modal__forgot" onClick={onBack}>← Back to Sign In</button>
    </>
  );
};

// ── Main Modal ────────────────────────────────────────────────
const AuthModal = ({ onClose, onLogin }) => {
  const [screen, setScreen] = useState('login');
  const [pendingUserId, setPendingUserId] = useState(null);
  const [pendingEmail, setPendingEmail] = useState('');

  const handleNeedsVerification = (userId, email) => {
    setPendingUserId(userId);
    setPendingEmail(email);
    setScreen('verify');
  };

  const handleForgotPassword = (userId, email) => {
    setPendingUserId(userId || null);
    setPendingEmail(email || '');
    setScreen('forgot');
  };

  const handleLogin = (user) => {
    onLogin(user);
    onClose();
  };

  return (
    <div className="auth-modal__backdrop" onClick={onClose}>
      <div className="auth-modal__card" onClick={(e) => e.stopPropagation()}>

        {/* Close */}
        <button className="auth-modal__close" onClick={onClose} aria-label="Close">
          <FaTimes />
        </button>

        {/* Logo */}
        <div className="auth-modal__logo-mark">
          <img src={logo} alt="Relstone" className="auth-modal__logo-img" />
        </div>

        {/* Screens */}
        {screen === 'login' && (
          <LoginForm
            onLogin={handleLogin}
            onSwitchToRegister={() => setScreen('register')}
            onForgotPassword={handleForgotPassword}
          />
        )}
        {screen === 'register' && (
          <RegisterForm
            onSwitchToLogin={() => setScreen('login')}
            onNeedsVerification={handleNeedsVerification}
          />
        )}
        {screen === 'verify' && (
          <VerifyForm
            userId={pendingUserId}
            email={pendingEmail}
            onLogin={handleLogin}
            onBack={() => setScreen('login')}
          />
        )}
        {screen === 'forgot' && (
          <ForgotPasswordForm
            userId={pendingUserId}
            email={pendingEmail}
            onBack={() => setScreen('login')}
          />
        )}

        {/* Legal */}
        <p className="auth-modal__legal">
          By continuing, you agree to our{' '}
          <a href="/terms" className="auth-modal__legal-link">Terms of Service</a>
          {' '}and{' '}
          <a href="/privacy" className="auth-modal__legal-link">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
};

export default AuthModal;