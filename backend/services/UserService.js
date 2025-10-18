const { User } = require('../models');
const { getAuth } = require('../config/firebase');

class UserService {
  /**
   * Create a new user with Firebase authentication
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} name - User name
   * @param {string} role - User role
   * @param {string} univId - University ID
   * @returns {Promise<Object>} Created user
   */
  async createUser(email, password, name, role, univId) {
    try {
      const auth = getAuth();
      
      // Check if Firebase user already exists and delete if found
      try {
        const existingUser = await auth.getUserByEmail(email);
        await auth.deleteUser(existingUser.uid);
        
        // Also delete from database if exists
        const existingDbUser = await User.findOne({ where: { email } });
        if (existingDbUser) {
          await existingDbUser.destroy();
        }
      } catch (error) {
        // User doesn't exist in Firebase, which is fine
        console.log('No existing Firebase user found');
      }

      // Create Firebase user
      const userRecord = await auth.createUser({
        email: email,
        password: password,
        displayName: name,
        emailVerified: true
      });

      // Create database user
      const user = await User.create({
        firebaseUid: userRecord.uid,
        email: email,
        name: name,
        role: role,
        univId: univId
      });

      return user;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Get user by Firebase UID
   * @param {string} firebaseUid - Firebase UID
   * @returns {Promise<Object|null>} User or null
   */
  async getUserByFirebaseUid(firebaseUid) {
    return await User.findOne({
      where: { firebaseUid }
    });
  }

  /**
   * Get user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User or null
   */
  async getUserByEmail(email) {
    return await User.findOne({
      where: { email }
    });
  }

  /**
   * Update user data
   * @param {string} firebaseUid - Firebase UID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated user or null
   */
  async updateUser(firebaseUid, updateData) {
    const [updatedRowsCount] = await User.update(updateData, {
      where: { firebaseUid }
    });

    if (updatedRowsCount === 0) {
      return null;
    }

    return await this.getUserByFirebaseUid(firebaseUid);
  }

  /**
   * Delete user
   * @param {string} firebaseUid - Firebase UID
   * @returns {Promise<boolean>} Success status
   */
  async deleteUser(firebaseUid) {
    try {
      const auth = getAuth();
      
      // Delete from Firebase
      await auth.deleteUser(firebaseUid);
      
      // Delete from database
      const deletedRowsCount = await User.destroy({
        where: { firebaseUid }
      });

      return deletedRowsCount > 0;
    } catch (error) {
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  /**
   * Get all users
   * @returns {Promise<Array>} Array of users
   */
  async getAllUsers() {
    return await User.findAll({
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Get users by role
   * @param {string} role - User role
   * @returns {Promise<Array>} Array of users
   */
  async getUsersByRole(role) {
    return await User.findAll({
      where: { role },
      order: [['createdAt', 'DESC']]
    });
  }
}

module.exports = new UserService();
