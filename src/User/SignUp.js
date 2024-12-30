import React, { useRef, useState, useEffect } from 'react';
import { useAuth } from '../User/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { doc, setDoc } from 'firebase/firestore';
import { getAuth, fetchSignInMethodsForEmail, createUserWithEmailAndPassword } from 'firebase/auth';
import { db } from '../Firebase/firebase'; 
import bcrypt from 'bcryptjs';  // Import bcryptjs for hashing
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';


export default function SignUp() {
  const nameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const dobRef = useRef(); 
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);
  const navigate = useNavigate();

  const defaultProfilePicture = 'https://example.com/default-profile-picture.png'; 

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
   

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);

      const auth = getAuth();
      const methods = await fetchSignInMethodsForEmail(auth, emailRef.current.value);

      if (methods.length > 0) {
        return setError('Email is already in use');
      }

      // Hash the password using bcrypt before saving it
      const hashedPassword = bcrypt.hashSync(passwordRef.current.value, 10); // 10 is the salt rounds

      // Create a new user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, emailRef.current.value, passwordRef.current.value);
      const user = userCredential.user;

      if (!user) {
        throw new Error('User creation failed');
      }

      // Save user data to Firestore with the UID of the newly created user
      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        name: nameRef.current.value,
        email: emailRef.current.value,
        dateOfBirth: dobRef.current.value,
        profilePicture: defaultProfilePicture, // Use the default profile picture
        hashedPassword: hashedPassword, // Save the hashed password in Firestore
  
      });

      navigate('/');
    } catch (error) {
      console.error('Failed to create an account', error);
      setError(`Failed to create an account: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignup() {
    try {
      setLoading(true);
      const user = await loginWithGoogle();
      const { displayName, email, photoURL } = user;

      const userDocRef = doc(db, 'users', user.uid);
      await setDoc(userDocRef, {
        name: displayName,
        email: email,
        dateOfBirth: null,
        profilePicture: photoURL || defaultProfilePicture,
      });

      navigate('/');
    } catch (error) {
      console.error('Failed to sign up with Google', error);
      setError('Failed to sign up with Google');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container-s">
      <div className="signup-box">
        <h2 className="signup-text">Sign Up</h2>
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <input type="text" ref={nameRef} placeholder="Name" required />
          </div>
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
                className={`toggle-password-L ${showPassword ? 'open' : ''}`}
                onClick={() => setShowPassword(!showPassword)}
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </span>
            </div>
          </div>
          <div className="input-group">
            <div className="password-input-wrapper">
              <input
                type={showPasswordConfirm ? 'text' : 'password'}
                ref={passwordConfirmRef}
                placeholder="Confirm Password"
                required
              />
              <span
                className={`toggle-password-L ${showPasswordConfirm ? 'open' : ''}`}
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              >
                <FontAwesomeIcon icon={showPasswordConfirm ? faEyeSlash : faEye} />
              </span>
            </div>
          </div>
          <div className="input-group">
            <input type="date" ref={dobRef} placeholder="Date of Birth" required />
          </div>
          <button type="submit" className="signup-button" disabled={loading}>
            Sign Up
          </button>
          <button
            type="button"
            className="google-login-button"
            onClick={handleGoogleSignup}
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

          <div className="login-link">
            Already have an account? <Link to="/login">Log In</Link>
          </div>
        </form>
      </div>

    </div>
  );
} 
