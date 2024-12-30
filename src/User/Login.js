import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../User/AuthContext'; 
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../Firebase/firebase';
import { getCSRFToken } from '../utlis/csrf';

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const rememberRef = useRef();
  const { login, loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const storedEmail = localStorage.getItem('rememberedEmail');
    if (storedEmail) {
      emailRef.current.value = storedEmail;
      rememberRef.current.checked = true;
    }
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    const csrfToken = await getCSRFToken();

    try {
      setError('');
      setLoading(true);
      const user = await login(emailRef.current.value, passwordRef.current.value, csrfToken);

      if (rememberRef.current.checked) {
        localStorage.setItem('rememberedEmail', emailRef.current.value);
      } else {
        localStorage.removeItem('rememberedEmail');
      }

      // Navigate to 2FA page regardless of email verification status
      navigate('/two-factor-auth'); 

      // If email is not verified, send verification email and display a message
      if (!user.emailVerified) {
        const send2FACode = httpsCallable(functions, 'send2FACode');
        await send2FACode({ email: user.email });
        setError('Verification email sent. Please verify your email.'); 
      } 

    } catch (error) {
      if (error.code === 'auth/wrong-password') {
        setError('Incorrect email or password.');
      } else if (error.code === 'auth/user-not-found') {
        setError('Email not found. Please create an account.');
      } else {
        setError('Failed to log in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      setLoading(true);
      const user = await loginWithGoogle(); 

      // Navigate to 2FA page regardless of email verification status
      navigate('/two-factor-auth'); 

      if (!user.emailVerified) {
        const send2FACode = httpsCallable(functions, 'send2FACode');
        await send2FACode({ email: user.email });
        setError('Verification email sent. Please verify your email.'); 
      } 

    } catch (error) {
      setError('Failed to log in with Google.');
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="container">
      <div className="login-box">
        <h2 className="login-text">Log In</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input type="email" ref={emailRef} placeholder="E-mail" required />
          </div>
          <div className="input-group">
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                ref={passwordRef}
                placeholder="Password"
                required
              />
              <span
                className="toggle-password-L"
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>
          </div>
          <div className="remember-me">
            <input type="checkbox" ref={rememberRef} />
            <label>Remember me</label>
          </div>
          <button type="submit" className="login-button" disabled={loading}>
            Log In
          </button>
          <button
            type="button"
            className="google-login-button"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <div className="gsi-material-button-content-wrapper">
              <div className="gsi-material-button-icon">
                <svg
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                  style={{ display: 'block' }}
                >
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span>Continue with Google</span>
            </div>
          </button>
          <div className="forgot-password">
            <Link to="/forgotpassword">Forgot password?</Link>
          </div>
          <div className="signup-link">
            Don't have an account? <Link to="/signup">Sign Up</Link>
          </div>
        </form>
      </div>
    </div>
  );
}