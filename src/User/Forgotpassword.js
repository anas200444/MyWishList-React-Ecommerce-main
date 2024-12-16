import React, { useRef, useState,useEffect } from 'react';
import { useAuth } from '../User/AuthContext';
import { Link } from 'react-router-dom';



export default function ForgotPassword() {
  const emailRef = useRef();
  const { resetPassword } = useAuth();
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    
    window.scrollTo(0, 0);
  }, []);
  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await resetPassword(emailRef.current.value);
      setMessage('Check your email inbox for further instructions.');
    } catch (error) {
      setError('Failed to reset password');
      console.error('Error sending password reset email:', error);
    }

    setLoading(false);
  }

  return (
    <div className="forgot-container">
      <div className="website-info">
        
        {}
      </div>
      <div className="forgot-box">
        <h2 className="forgot-text">Forgot Password?</h2>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input type="email" ref={emailRef} placeholder="E-mail" required />
          </div>
          <button type="submit" className="forgot-button" disabled={loading}>
            Reset Password
          </button>
        </form>
        <div className="login-link">
          Remember your password? <Link to="/login">Log In</Link>
        </div>
      </div>
     
    </div>
  );
}
