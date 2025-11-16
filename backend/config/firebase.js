const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  try {
    if (admin.apps.length === 0) {
      // Validate required environment variables
      const requiredEnvVars = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_PRIVATE_KEY_ID',
        'FIREBASE_PRIVATE_KEY',
        'FIREBASE_CLIENT_EMAIL',
        'FIREBASE_CLIENT_ID'
      ];

      const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
      
      if (missingVars.length > 0) {
        throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
      }

      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
        token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });

      console.log('Firebase Admin SDK initialized successfully.');
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    if (process.env.NODE_ENV === 'production') {
      throw error; // Fail fast in production
    }
  }
};

// Get Firebase Auth instance
const getAuth = () => {
  return admin.auth();
};

// Verify Firebase ID token
const verifyIdToken = async (idToken) => {
  try {
    if (!idToken || typeof idToken !== 'string') {
      throw new Error('ID token is required and must be a string');
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    // Provide more specific error messages
    if (error.code === 'auth/id-token-expired') {
      throw new Error('Firebase ID token has expired');
    }
    if (error.code === 'auth/argument-error') {
      throw new Error('Invalid Firebase ID token format');
    }
    if (error.code === 'auth/invalid-id-token') {
      throw new Error('Invalid Firebase ID token');
    }
    throw new Error(`Token verification failed: ${error.message || 'Invalid Firebase ID token'}`);
  }
};

module.exports = {
  initializeFirebase,
  getAuth,
  verifyIdToken,
  admin
};
