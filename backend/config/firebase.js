const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    if (admin.apps.length === 0) {
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });

      console.log('Firebase Admin SDK initialized successfully.');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
  }
};

// Get Firebase Auth instance
const getAuth = () => {
  return admin.auth();
};

// Verify Firebase ID token
const verifyIdToken = async (idToken) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error('Invalid Firebase ID token');
  }
};

module.exports = {
  initializeFirebase,
  getAuth,
  verifyIdToken,
  admin
};
