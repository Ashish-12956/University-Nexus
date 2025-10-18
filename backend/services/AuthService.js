const { User } = require('../models');
const { verifyIdToken } = require('../config/firebase');

class AuthService {
  /**
   * Verify Firebase ID token and get user from database
   * @param {string} idToken - Firebase ID token
   * @returns {Promise<Object|null>} User object or null if not found
   */
  async verifyTokenAndGetUser(idToken) {
    try {
      const decodedToken = await verifyIdToken(idToken);
      const uid = decodedToken.uid;
      
      const user = await User.findOne({
        where: { firebaseUid: uid }
      });
      
      return user;
    } catch (error) {
      throw new Error('Invalid Firebase ID token');
    }
  }

  /**
   * Verify token and check if user has access to requested resource
   * @param {string} idToken - Firebase ID token
   * @param {string} requestedFirebaseUid - Firebase UID of the requested resource
   * @returns {Promise<void>}
   */
  async verifyTokenAndCheckAccess(idToken, requestedFirebaseUid) {
    try {
      const decodedToken = await verifyIdToken(idToken);
      const tokenFirebaseUid = decodedToken.uid;

      const user = await User.findOne({
        where: { firebaseUid: tokenFirebaseUid }
      });

      if (!user) {
        throw new Error('User not found in database');
      }

      if (user.firebaseUid !== requestedFirebaseUid) {
        throw new Error('Access denied: You can only access your own data');
      }
    } catch (error) {
      throw new Error(`Access verification failed: ${error.message}`);
    }
  }

  /**
   * Get user by Firebase UID
   * @param {string} firebaseUid - Firebase UID
   * @returns {Promise<Object|null>} User object or null
   */
  async getUserByFirebaseUid(firebaseUid) {
    return await User.findOne({
      where: { firebaseUid }
    });
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  async getUserByEmail(email) {
    return await User.findOne({
      where: { email }
    });
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    return await User.create(userData);
  }

  /**
   * Update user data
   * @param {string} firebaseUid - Firebase UID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Updated user
   */
  async updateUser(firebaseUid, updateData) {
    const [updatedRowsCount] = await User.update(updateData, {
      where: { firebaseUid }
    });

    if (updatedRowsCount === 0) {
      throw new Error('User not found');
    }

    return await this.getUserByFirebaseUid(firebaseUid);
  }

  /**
   * Delete user
   * @param {string} firebaseUid - Firebase UID
   * @returns {Promise<boolean>} Success status
   */
  async deleteUser(firebaseUid) {
    const deletedRowsCount = await User.destroy({
      where: { firebaseUid }
    });

    return deletedRowsCount > 0;
  }
}

module.exports = new AuthService();
