const { Announcement } = require('../models');

class AnnouncementService {
  /**
   * Create a new announcement
   * @param {Object} announcementData - Announcement data
   * @returns {Promise<Object>} Created announcement
   */
  async sendAnnouncement(announcementData) {
    return await Announcement.create(announcementData);
  }

  /**
   * Get all announcements (most recent first)
   * @returns {Promise<Array>} Array of announcements
   */
  async getAllAnnouncements() {
    return await Announcement.findAll({
      order: [['id', 'DESC']]
    });
  }

  /**
   * Delete an announcement
   * @param {number} id - Announcement ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteAnnouncement(id) {
    const deletedRowsCount = await Announcement.destroy({
      where: { id }
    });
    return deletedRowsCount > 0;
  }

  /**
   * Get the most recent announcement
   * @returns {Promise<Object|null>} Most recent announcement or null
   */
  async getCurrentAnnouncement() {
    return await Announcement.findOne({
      order: [['id', 'DESC']]
    });
  }

  /**
   * Get announcement by ID
   * @param {number} id - Announcement ID
   * @returns {Promise<Object|null>} Announcement or null
   */
  async getAnnouncementById(id) {
    return await Announcement.findByPk(id);
  }

  /**
   * Update an announcement
   * @param {number} id - Announcement ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated announcement or null
   */
  async updateAnnouncement(id, updateData) {
    const [updatedRowsCount] = await Announcement.update(updateData, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return null;
    }

    return await this.getAnnouncementById(id);
  }

  /**
   * Get paginated announcements
   * @param {number} page - Page number (1-based)
   * @param {number} limit - Number of items per page
   * @returns {Promise<Object>} Paginated results
   */
  async getPaginatedAnnouncements(page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    
    const { count, rows } = await Announcement.findAndCountAll({
      order: [['id', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    return {
      announcements: rows,
      totalCount: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      hasNextPage: page < Math.ceil(count / limit),
      hasPrevPage: page > 1
    };
  }
}

module.exports = new AnnouncementService();
