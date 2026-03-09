import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Login.css'
import { login, register, otpSend, otpVerify } from '../api'

const TABS = { password: 'Password', otp: 'OTP' }

export default function Login({ onLogin }) {
  const [tab, setTab] = useState('password')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('') // NEW
  const [showPassword, setShowPassword] = useState(false) // NEW
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isRegister, setIsRegister] = useState(false)

  // Verification states
  const [verifyingEmail, setVerifyingEmail] = useState(false)
  const [verifyingLogin, setVerifyingLogin] = useState(false)
  const [otpSent, setOtpSent] = useState(false)

  // --- TAB 1: PASSWORD + 2FA LOGIC ---
  async function handlePasswordSubmit(e) {
    e.preventDefault();
    setError('');

    // NEW: Strict Password Complexity Validation (Only run on Registration)
    if (isRegister && !verifyingEmail) {
      if (password !== confirmPassword) {
        return setError("Passwords do not match");
      }

      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(password)) {
        return setError("Password must be at least 8 characters and include 1 uppercase letter, 1 number, and 1 special character.");
      }
    }

    // NEW: Strict 6-Digit OTP Validation 
    if ((verifyingEmail || verifyingLogin)) {
      const otpRegex = /^\d{6}$/;
      if (!otpRegex.test(otp)) {
        return setError("OTP must be exactly 6 digits.");
      }
    }

    setLoading(true);

    try {
      if (isRegister) {
        if (!verifyingEmail) {
          await otpSend(email, true); // NEW: pass true for isRegister
          setVerifyingEmail(true);
          setOtp('');
        } else {
          const data = await register({ username, email, password, otp });
          onLogin(data);
        }
      } else {
        const res = await login({ username, password, otp });

        if (res.step === '2FA_REQUIRED') {
          setVerifyingLogin(true);
          setOtp('');
        } else if (res.token) {
          onLogin(res);
        }
      }
    } catch (err) {
      setError(err.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  }

  // --- TAB 2: OTP-ONLY LOGIN LOGIC ---
  async function handleOtpTabSubmit(e) {
    e.preventDefault();
    setError('');

    // NEW: Strict 6-Digit OTP Validation 
    if (otpSent) {
      const otpRegex = /^\d{6}$/;
      if (!otpRegex.test(otp)) {
        return setError("OTP must be exactly 6 digits.");
      }
    }

    setLoading(true);

    try {
      if (!otpSent) {
        await otpSend(phone);
        setOtpSent(true);
      } else {
        const data = await otpVerify(phone, otp);
        onLogin(data);
      }
    } catch (err) {
      setError(err.message || 'OTP Action failed');
    } finally {
      setLoading(false);
    }
  }

  const handleTabChange = (k) => {
    setTab(k);
    setError('');
    setVerifyingEmail(false);
    setVerifyingLogin(false);
    setOtpSent(false);
    setOtp('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="auth-page-wrapper" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', background: '#f8fafc' }}>
      <div className="container" style={{ width: '100%' }}>
        <div className="card" style={{ maxWidth: 400, margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' }}>

          {/* BRAND NAME WITH GRADIENT */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h1 style={{
              fontSize: '32px', fontWeight: '900', letterSpacing: '2px', margin: 0,
              backgroundImage: 'linear-gradient(45deg, #2563eb, #9333ea, #db2777)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              display: 'inline-block'
            }}>
              HALLOW
            </h1>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '5px' }}>
              {isRegister ? 'Create your account' : 'Welcome back'}
            </p>
          </div>

          {/* TAB SWITCHER */}
          <div className="tab-container" style={{ marginBottom: '1.5rem', display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
            {Object.entries(TABS).map(([k, label]) => (
              <button
                key={k}
                type="button"
                onClick={() => handleTabChange(k)}
                style={{
                  flex: 1,
                  background: tab === k ? '#fff' : 'transparent',
                  color: tab === k ? '#2563eb' : '#64748b',
                  border: 'none', padding: '0.6rem', borderRadius: 6, fontWeight: '700',
                  boxShadow: tab === k ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                  cursor: 'pointer', transition: 'all 0.2s'
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {error && (
            <div style={{ color: '#b91c1c', background: '#fee2e2', padding: '12px', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', textAlign: 'center', border: '1px solid #fecaca' }}>
              {error}
            </div>
          )}

          {/* PASSWORD TAB */}
          {tab === 'password' && (
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '0.9rem' }}>Email Address</label>
                <input
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  disabled={verifyingEmail || verifyingLogin}
                  placeholder="name@example.com"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              {!verifyingEmail && !verifyingLogin && (
                <>
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '0.9rem' }}>Username</label>
                    <input
                      className="auth-input"
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      required
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    />
                  </div>

                  {/* PASSWORD WITH EYE ICON */}
                  <div className="form-group" style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '0.9rem' }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="auth-input"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: '0', color: '#64748b' }}
                      >
                        {showPassword ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* CONFIRM PASSWORD FOR REGISTRATION ONLY */}
                  {isRegister && (
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '0.9rem' }}>Confirm Password</label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPassword ? "text" : "password"}
                          className="auth-input"
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          required
                          style={{ width: '100%', padding: '10px 40px 10px 10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {(verifyingLogin || (isRegister && verifyingEmail)) && (
                <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '10px', border: '1px solid #bfdbfe', textAlign: 'center' }}>
                  <label style={{ color: '#1e40af', fontWeight: '800', display: 'block', marginBottom: '10px' }}>Enter 6-Digit Code</label>
                  <input
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    placeholder="000000"
                    required
                    autoFocus
                    style={{ width: '80%', padding: '10px', textAlign: 'center', fontSize: '1.5rem', letterSpacing: '8px', border: '2px solid #2563eb', borderRadius: '8px' }}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#60a5fa', marginTop: '10px' }}>Check your email for the code</p>
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', marginTop: '1.5rem', padding: '12px',
                background: 'linear-gradient(45deg, #2563eb, #9333ea)',
                color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700',
                cursor: 'pointer', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
              }}>
                {loading ? 'Please wait...' : (isRegister ? (verifyingEmail ? 'Finalize Account' : 'Register Now') : (verifyingLogin ? 'Verify Identity' : 'Sign In'))}
              </button>

              <button type="button" onClick={() => {
                setIsRegister(!isRegister);
                setVerifyingEmail(false);
                setVerifyingLogin(false);
                setError('');
                setPassword('');
                setConfirmPassword('');
              }} style={{ background: 'none', border: 'none', color: '#2563eb', marginTop: '1.2rem', width: '100%', cursor: 'pointer', fontSize: '0.9rem', fontWeight: '600' }}>
                {isRegister ? 'Already have an account? Login' : "Don't have an account? Create Now"}
              </button>
            </form>
          )}

          {/* OTP ONLY TAB */}
          {tab === 'otp' && (
            <form onSubmit={handleOtpTabSubmit}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600', fontSize: '0.9rem' }}>Phone Number</label>
                <input
                  type="tel"
                  className="auth-input"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  required
                  disabled={otpSent}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              {otpSent && (
                <div style={{ background: '#f0fdf4', padding: '20px', borderRadius: '10px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
                  <label style={{ color: '#166534', fontWeight: '800', display: 'block', marginBottom: '10px' }}>One-Time Password</label>
                  <input
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    placeholder="Enter OTP"
                    required
                    autoFocus
                    style={{ width: '80%', padding: '10px', textAlign: 'center', fontSize: '1.2rem', border: '2px solid #16a34a', borderRadius: '8px' }}
                  />
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', marginTop: '1.5rem', padding: '12px',
                background: '#16a34a', color: '#fff', border: 'none',
                borderRadius: '8px', fontWeight: '700', cursor: 'pointer'
              }}>
                {loading ? 'Working...' : (otpSent ? 'Secure Login' : 'Get OTP Code')}
              </button>

              {otpSent && (
                <button type="button" onClick={() => setOtpSent(false)} style={{ background: 'none', border: 'none', color: '#64748b', marginTop: '1rem', width: '100%', cursor: 'pointer', fontSize: '0.8rem' }}>
                  ← Use a different number
                </button>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  )
}