const { SubjectEnrollment, Student, Faculty } = require('../models');

class SubjectEnrollmentService {
  /**
   * Create enrollment for all students
   * @param {Object} request - Enrollment request
   * @returns {Promise<Object>} Created enrollment
   */
  async createEnrollmentForAllStudents(request) {
    const { emailId, subjectName, subjectCode, credits } = request;

    // Verify faculty exists
    const faculty = await Faculty.findOne({
      where: { email: emailId }
    });
    if (!faculty) {
      throw new Error(`Faculty not found with email: ${emailId}`);
    }

    // Get all students
    const students = await Student.findAll();
    if (students.length === 0) {
      throw new Error('No students available for enrollment');
    }

    // Create new subject enrollment
    const enrollment = await SubjectEnrollment.create({
      subjectName,
      subjectCode,
      credits,
      facultyEmail: faculty.email
    });

    // Enroll all students in the subject
    await enrollment.setEnrolledStudents(students);

    return enrollment;
  }

  /**
   * Create enrollment for specific students
   * @param {Object} request - Enrollment request with student emails
   * @returns {Promise<Object>} Created enrollment
   */
  async createEnrollmentForSpecificStudents(request) {
    const { emailId, subjectName, subjectCode, credits, studentEmails } = request;

    // Verify faculty exists
    const faculty = await Faculty.findOne({
      where: { email: emailId }
    });
    if (!faculty) {
      throw new Error(`Faculty not found with email: ${emailId}`);
    }

    // Verify all students exist
    const students = await Student.findAll({
      where: { email: studentEmails }
    });

    if (students.length !== studentEmails.length) {
      throw new Error('One or more students not found');
    }

    // Create new subject enrollment
    const enrollment = await SubjectEnrollment.create({
      subjectName,
      subjectCode,
      credits,
      facultyEmail: faculty.email
    });

    // Enroll specific students in the subject
    await enrollment.setEnrolledStudents(students);

    return enrollment;
  }

  /**
   * Get all subject enrollments
   * @returns {Promise<Array>} Array of enrollments
   */
  async getAllEnrollments() {
    return await SubjectEnrollment.findAll({
      include: [
        { model: Faculty, as: 'faculty' },
        { model: Student, as: 'enrolledStudents' }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Get enrollment by ID
   * @param {number} id - Enrollment ID
   * @returns {Promise<Object|null>} Enrollment or null
   */
  async getEnrollmentById(id) {
    return await SubjectEnrollment.findByPk(id, {
      include: [
        { model: Faculty, as: 'faculty' },
        { model: Student, as: 'enrolledStudents' }
      ]
    });
  }

  /**
   * Get enrollments by faculty
   * @param {string} facultyEmail - Faculty email
   * @returns {Promise<Array>} Array of enrollments
   */
  async getEnrollmentsByFaculty(facultyEmail) {
    return await SubjectEnrollment.findAll({
      where: { facultyEmail },
      include: [
        { model: Faculty, as: 'faculty' },
        { model: Student, as: 'enrolledStudents' }
      ],
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Get enrollments by student
   * @param {string} studentEmail - Student email
   * @returns {Promise<Array>} Array of enrollments
   */
  async getEnrollmentsByStudent(studentEmail) {
    const student = await Student.findOne({
      where: { email: studentEmail },
      include: [
        { 
          model: SubjectEnrollment, 
          as: 'enrolledStudents',
          include: [{ model: Faculty, as: 'faculty' }]
        }
      ]
    });

    return student ? student.enrolledStudents : [];
  }

  /**
   * Add student to enrollment
   * @param {number} enrollmentId - Enrollment ID
   * @param {string} studentEmail - Student email
   * @returns {Promise<boolean>} Success status
   */
  async addStudentToEnrollment(enrollmentId, studentEmail) {
    const enrollment = await SubjectEnrollment.findByPk(enrollmentId);
    const student = await Student.findOne({ where: { email: studentEmail } });

    if (!enrollment || !student) {
      return false;
    }

    await enrollment.addEnrolledStudents(student);
    return true;
  }

  /**
   * Remove student from enrollment
   * @param {number} enrollmentId - Enrollment ID
   * @param {string} studentEmail - Student email
   * @returns {Promise<boolean>} Success status
   */
  async removeStudentFromEnrollment(enrollmentId, studentEmail) {
    const enrollment = await SubjectEnrollment.findByPk(enrollmentId);
    const student = await Student.findOne({ where: { email: studentEmail } });

    if (!enrollment || !student) {
      return false;
    }

    await enrollment.removeEnrolledStudents(student);
    return true;
  }

  /**
   * Update enrollment
   * @param {number} id - Enrollment ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated enrollment or null
   */
  async updateEnrollment(id, updateData) {
    const [updatedRowsCount] = await SubjectEnrollment.update(updateData, {
      where: { id }
    });

    if (updatedRowsCount === 0) {
      return null;
    }

    return await this.getEnrollmentById(id);
  }

  /**
   * Delete enrollment
   * @param {number} id - Enrollment ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteEnrollment(id) {
    const deletedRowsCount = await SubjectEnrollment.destroy({
      where: { id }
    });

    return deletedRowsCount > 0;
  }
}

module.exports = new SubjectEnrollmentService();
