const { Attendance, Student, Faculty, SubjectEnrollment } = require('../models');
const { Op } = require('sequelize');

class AttendanceService {
  /**
   * Mark bulk attendance for multiple students
   * @param {Object} request - Bulk attendance request
   * @returns {Promise<Array>} Array of attendance records
   */
  async markBulkAttendance(request) {
    const { facultyEmail, subjectId, date, studentAttendances } = request;
    
    // Verify faculty exists
    const faculty = await Faculty.findOne({
      where: { email: facultyEmail }
    });
    if (!faculty) {
      throw new Error('Faculty not found');
    }

    // Verify subject exists and faculty teaches it
    const subject = await SubjectEnrollment.findOne({
      where: { id: subjectId },
      include: [{ model: Faculty, as: 'faculty' }]
    });
    if (!subject) {
      throw new Error('Subject not found');
    }
    if (subject.faculty.email !== facultyEmail) {
      throw new Error('Faculty doesn\'t teach this subject');
    }

    const attendanceDate = date || new Date().toISOString().split('T')[0];
    const results = [];

    for (const sa of studentAttendances) {
      // Verify student exists
      const student = await Student.findOne({
        where: { email: sa.studentEmail }
      });
      if (!student) {
        throw new Error(`Student not found: ${sa.studentEmail}`);
      }

      // Check if student is enrolled in the subject
      const isEnrolled = await subject.hasEnrolledStudents(student);
      if (!isEnrolled) {
        throw new Error(`Student not enrolled: ${student.email}`);
      }

      // Find or create attendance record
      let attendance = await Attendance.findOne({
        where: {
          studentEmail: student.email,
          subjectId: subject.id,
          date: attendanceDate
        }
      });

      if (!attendance) {
        attendance = await Attendance.create({
          studentEmail: student.email,
          facultyEmail: faculty.email,
          subjectId: subject.id,
          date: attendanceDate,
          present: sa.present,
          remarks: sa.remarks
        });
      } else {
        await attendance.update({
          present: sa.present,
          remarks: sa.remarks
        });
      }

      results.push(attendance);
    }

    return results;
  }

  /**
   * Get attendance by subject and date
   * @param {number} subjectId - Subject ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Array>} Array of attendance records
   */
  async getAttendanceBySubjectAndDate(subjectId, date) {
    return await Attendance.findAll({
      where: {
        subjectId,
        date
      },
      include: [
        { model: Student, as: 'student' },
        { model: Faculty, as: 'faculty' },
        { model: SubjectEnrollment, as: 'subject' }
      ]
    });
  }

  /**
   * Get subjects by faculty
   * @param {string} facultyEmail - Faculty email
   * @returns {Promise<Array>} Array of subjects
   */
  async getSubjectsByFaculty(facultyEmail) {
    return await SubjectEnrollment.findAll({
      where: { facultyEmail },
      include: [
        { model: Faculty, as: 'faculty' },
        { model: Student, as: 'enrolledStudents' }
      ]
    });
  }

  /**
   * Get subject with enrolled students
   * @param {number} subjectId - Subject ID
   * @returns {Promise<Object>} Subject with students
   */
  async getSubjectWithStudents(subjectId) {
    const subject = await SubjectEnrollment.findOne({
      where: { id: subjectId },
      include: [
        { model: Faculty, as: 'faculty' },
        { model: Student, as: 'enrolledStudents' }
      ]
    });

    if (!subject) {
      throw new Error('Subject not found');
    }

    return subject;
  }

  /**
   * Get attendance statistics for a subject
   * @param {number} subjectId - Subject ID
   * @returns {Promise<Object>} Attendance statistics
   */
  async getSubjectAttendanceStats(subjectId) {
    // Get distinct class dates
    const classDates = await Attendance.findAll({
      attributes: ['date'],
      where: { subjectId },
      group: ['date'],
      raw: true
    });

    // Get all attendance records for the subject
    const attendances = await Attendance.findAll({
      where: { subjectId }
    });

    const totalClasses = classDates.length;
    const totalPresent = attendances.filter(a => a.present).length;
    const totalPossibleAttendances = totalClasses * attendances.length;
    const attendancePercentage = totalPossibleAttendances > 0 
      ? Math.round((totalPresent * 100.0 / totalPossibleAttendances) * 100) / 100.0 
      : 0;

    return {
      totalClasses,
      totalPresent,
      attendancePercentage
    };
  }

  /**
   * Find specific attendance record
   * @param {string} studentEmail - Student email
   * @param {number} subjectId - Subject ID
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Object|null>} Attendance record or null
   */
  async findAttendance(studentEmail, subjectId, date) {
    return await Attendance.findOne({
      where: {
        studentEmail,
        subjectId,
        date
      }
    });
  }

  /**
   * Get student attendance history
   * @param {string} studentEmail - Student email
   * @param {number} subjectId - Subject ID (optional)
   * @returns {Promise<Array>} Array of attendance records
   */
  async getStudentAttendanceHistory(studentEmail, subjectId = null) {
    const whereClause = { studentEmail };
    if (subjectId) {
      whereClause.subjectId = subjectId;
    }

    return await Attendance.findAll({
      where: whereClause,
      include: [
        { model: SubjectEnrollment, as: 'subject' },
        { model: Faculty, as: 'faculty' }
      ],
      order: [['date', 'DESC']]
    });
  }
}

module.exports = new AttendanceService();
