import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../User/AuthContext';
import { storage, db, deleteUserData } from '../Firebase/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import defaultProfilePic from './profile-pic.jpg';


export default function Profile() {
    const { currentUser } = useAuth();
    const [profilePicture, setProfilePicture] = useState(defaultProfilePic);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [dob, setDob] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [canUpdateProfile, setCanUpdateProfile] = useState(true);
    const [newProfilePicture, setNewProfilePicture] = useState(null);
    const [showChangePassword, setShowChangePassword] = useState(true);
    const [showChangeEmail, setShowChangeEmail] = useState(true);

    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    useEffect(() => {
        async function fetchUserData() {
            if (currentUser) {
                const userDoc = doc(db, 'users', currentUser.uid);
                const userSnap = await getDoc(userDoc);
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    setName(userData.name || '');
                    setEmail(userData.email || '');
                    setDob(userData.dateOfBirth || '');
                    setProfilePicture(userData.profilePicture || defaultProfilePic);
                    setCanUpdateProfile(userData.canUpdateProfile || true);

                    const isGoogleSignIn = currentUser.providerData.some(
                        (provider) => provider.providerId === 'google.com'
                    );
                    setShowChangePassword(!isGoogleSignIn);
                    setShowChangeEmail(!isGoogleSignIn);
                }
            }
        }
        fetchUserData();

        
        window.scrollTo(0, 0);
    }, [currentUser]);

    async function handleUpdateProfile(e) {
        e.preventDefault();
    
        if (!canUpdateProfile) {
            return setError('You cannot update your profile.');
        }
    
        try {
            setLoading(true);
            const userDoc = doc(db, 'users', currentUser.uid);
    
            if (newProfilePicture) {
                const pictureRef = ref(storage, `profilePictures/${currentUser.uid}`);
                await uploadBytes(pictureRef, newProfilePicture);
                const pictureURL = await getDownloadURL(pictureRef);
                await updateDoc(userDoc, { profilePicture: pictureURL });
                setProfilePicture(pictureURL);
            }
    
            await updateDoc(userDoc, {
                name,
                dateOfBirth: dob,
                email,
            });
    
            setError('');
            alert('Profile updated successfully!');
            
            
            window.location.reload();
        } catch (error) {
            console.error("Error updating profile:", error);
            setError('Failed to update profile. Please try again later.');
        } finally {
            setLoading(false);
        }
    }
    
    async function handleDeleteAccount() {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            try {
                setLoading(true);
                await deleteUserData(currentUser);
            } catch (error) {
                console.error("Error deleting account:", error);
                setError('Failed to delete account. Please try again later.');
            } finally {
                setLoading(false);
            }
        }
    }

    function handleProfilePictureClick() {
        fileInputRef.current.click();
    }

    function handleProfilePictureChange(e) {
        const file = e.target.files[0];
        if (file) {
            setNewProfilePicture(file);
            setProfilePicture(URL.createObjectURL(file));
        }
    }

    return (
        <div>
            
            <div className="profile-container">
                <h2>Profile</h2>
                {error && <p className="error">{error}</p>}
                <form onSubmit={handleUpdateProfile}>
                    <div className="form-group">
                        <img
                            src={profilePicture}
                            alt="Profile"
                            style={{ width: '100px', height: '100px', borderRadius: '50%', cursor: 'pointer' }}
                            onClick={handleProfilePictureClick}
                        />
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfilePictureChange}
                            ref={fileInputRef}
                            style={{ display: 'none' }} 
                        />
                    </div>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            disabled={!canUpdateProfile}
                        />
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            value={email}
                            disabled
                        />
                    </div>
                    <div className="form-group">
                        <label>Date of Birth</label>
                        <input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            disabled={!canUpdateProfile}
                        />
                    </div>
                    
                    <button className="button-profile update-profile" type="submit" disabled={loading || !canUpdateProfile}>
                        Update Profile
                    </button>
                </form>

                {showChangeEmail && (
                    <button className="button-profile change-email-button" onClick={() => navigate('/changeemail')}>
                        Change Email
                    </button>
                )}

                {showChangePassword && (
                    <button className="button-profile change-password-button" onClick={() => navigate('/changepassword')}>
                        Change Password
                    </button>
                )}
                <button id="delete-button" className="button-profile delete-account-button" onClick={handleDeleteAccount} disabled={loading}>
                    Delete Account
                </button>
            </div>
           
        </div>
    );
}