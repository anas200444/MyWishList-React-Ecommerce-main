import { initializeApp } from 'firebase/app';
import { getAuth, deleteUser } from 'firebase/auth';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from "firebase/database";
import { getFunctions } from "firebase/functions"; // Import Functions

const firebaseConfig = {
  apiKey: "AIzaSyD2yW5R21l6X5dUfLyq9Fd7U7MwP-IPDQs",
  authDomain: "websecurity-commerce.firebaseapp.com",
  projectId: "websecurity-commerce",
  storageBucket: "websecurity-commerce.firebasestorage.app",
  messagingSenderId: "992431075252",
  appId: "1:992431075252:web:4acae0865bfbcb513d8ce1",
  measurementId: "G-3GQXXRHB2J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Initialize storage
const realtimeDb = getDatabase(app);
const functions = getFunctions(app); // Initialize functions

async function deleteUserData(user) {
  try {
    const userEmail = user.email;

    // Delete user's videos from Firestore
    const userVideoCollection = collection(db, 'videos', userEmail, 'userVideos');
    const videoSnapshot = await getDocs(userVideoCollection);

    for (const videoDoc of videoSnapshot.docs) {
      await deleteDoc(videoDoc.ref);
    }

    // Delete user document from Firestore
    const userDoc = doc(db, 'users', user.uid);
    await deleteDoc(userDoc);

    // Delete the user from Firebase Authentication
    await deleteUser(user);

    alert('Your account and all associated videos have been deleted.');
  } catch (error) {
    console.error('Error deleting user data:', error);
    alert('Failed to delete account. Please try again.');
  }
}

// Export Firebase services
export { auth, db, storage,deleteUserData, realtimeDb, functions };