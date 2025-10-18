const { Student, Faculty, User } = require('../models');
const UserService = require('./UserService');
const csv = require('csv-parser');
const fs = require('fs');

class AdminService {
  /**
   * Generate roll number
   * @param {number} year - Year
   * @param {string} branch - Branch
   * @param {number} id - Student ID
   * @returns {string} Generated roll number
   */
  generateRollNo(year, branch, id) {
    return `${year}${branch}${id}`;
  }

  /**
   * Generate password from date of birth
   * @param {string} dob - Date of birth
   * @returns {string} Generated password
   */
  generatePassword(dob) {
    return dob.toString();
  }

  /**
   * Generate university ID for student
   * @param {string} name - Student name
   * @param {number} contactNo - Contact number
   * @returns {string} Generated university ID
   */
  generateUnivId(name, contactNo) {
    const lastDigit = contactNo % 10;
    const secondLastDigit = Math.floor((contactNo / 10) % 10);
    const thirdLastDigit = Math.floor((contactNo / 100) % 10);

    const nameParts = name.split(/\s+/);
    const firstName = nameParts[0];

    return this.reverse(firstName) + 
           thirdLastDigit + 
           secondLastDigit + 
           lastDigit + 
           Math.floor(Math.random() * 100) + 
           '@stu.edu';
  }

  /**
   * Generate university ID for faculty
   * @param {string} name - Faculty name
   * @param {number} contactNo - Contact number
   * @returns {string} Generated university ID
   */
  generateUnivIdFaculty(name, contactNo) {
    const lastDigit = contactNo % 10;
    const secondLastDigit = Math.floor((contactNo / 10) % 10);
    const thirdLastDigit = Math.floor((contactNo / 100) % 10);

    const nameParts = name.split(/\s+/);
    const firstName = nameParts[1] || nameParts[0]; // Use second name if available

    return this.reverse(firstName) + 
           thirdLastDigit + 
           secondLastDigit + 
           lastDigit + 
           Math.floor(Math.random() * 100) + 
           '@univ.edu';
  }

  /**
   * Reverse a string
   * @param {string} str - String to reverse
   * @returns {string} Reversed string
   */
  reverse(str) {
    return str.split('').reverse().join('');
  }

  /**
   * Parse CSV file and return student data
   * @param {string} filePath - Path to CSV file
   * @returns {Promise<Array>} Array of student data
   */
  async parseCsv(filePath) {
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => resolve(results))
        .on('error', reject);
    });
  }

  /**
   * Upload student details in bulk from CSV
   * @param {string} filePath - Path to CSV file
   * @returns {Promise<number>} Number of students uploaded
   */
  async uploadDetailsOfStudentsBulk(filePath) {
    try {
      const csvData = await this.parseCsv(filePath);
      const students = [];

      for (const row of csvData) {
        const studentData = {
          name: row.name,
          course: row.course,
          branch: row.branch,
          semester: parseInt(row.semester),
          year: parseInt(row.year),
          enrollmentCode: row.enrollmentCode,
          enrollmentCompleted: row.enrollmentCompleted === 'true',
          rollNo: row.rollNo,
          dob: row.dob,
          contactNo: parseInt(row.contactNo),
          address: row.address,
          gender: row.gender,
          nationality: row.nationality,
          bloodGroup: row.bloodGroup,
          parentContactNo: parseInt(row.parentContactNo),
          parentName: row.parentName,
          parentOccupation: row.parentOccupation,
          email: row.emailId,
          univId: this.generateUnivId(row.name, parseInt(row.contactNo))
        };

        students.push(studentData);
      }

      // Save students to database
      const savedStudents = await Student.bulkCreate(students);

      // Create Firebase users and update students
      for (const student of savedStudents) {
        const rollNo = this.generateRollNo(student.year, student.branch, student.id);
        const password = this.generatePassword(student.dob);
        
        student.rollNo = rollNo;
        student.password = password;
        student.univId = this.generateUnivId(student.name, student.contactNo);

        // Create Firebase user
        const user = await UserService.createUser(
          student.email,
          student.password,
          student.name,
          'student',
          student.univId
        );
        
        student.firebaseUid = user.firebaseUid;
        await student.save();
      }

      return savedStudents.length;
    } catch (error) {
      throw new Error(`Failed to upload students: ${error.message}`);
    }
  }

  /**
   * Upload individual student detail
   * @param {Object} studentData - Student data
   * @returns {Promise<Object>} Created student
   */
  async uploadStudentDetail(studentData) {
    // Check if email already exists
    const existingStudent = await Student.findOne({
      where: { email: studentData.email }
    });
    
    if (existingStudent) {
      throw new Error('Email already exists');
    }

    // Set default values
    if (!studentData.password) {
      studentData.password = studentData.dob ? 
        this.generatePassword(studentData.dob) : 'password123';
    }

    // Save student first to generate ID
    const savedStudent = await Student.create(studentData);

    // Generate roll number if not provided
    if (!savedStudent.rollNo) {
      const rollNo = this.generateRollNo(
        savedStudent.year || 1,
        savedStudent.branch || 'GEN',
        savedStudent.id
      );
      savedStudent.rollNo = rollNo;
    }

    // Generate university ID if not provided
    if (!savedStudent.univId) {
      savedStudent.univId = this.generateUnivId(
        savedStudent.name,
        savedStudent.contactNo || 1234567890
      );
    }

    try {
      // Create Firebase user
      const user = await UserService.createUser(
        savedStudent.email,
        savedStudent.password,
        savedStudent.name,
        'student',
        savedStudent.univId
      );
      
      savedStudent.firebaseUid = user.firebaseUid;
      return await savedStudent.save();
    } catch (error) {
      // If Firebase fails, delete the student record
      await savedStudent.destroy();
      throw new Error(`Failed to create Firebase user: ${error.message}`);
    }
  }

  /**
   * Upload faculty detail
   * @param {Object} facultyData - Faculty data
   * @returns {Promise<Object>} Created faculty
   */
  async uploadFacultyDetail(facultyData) {
    const savedFaculty = await Faculty.create(facultyData);
    
    savedFaculty.password = this.generatePassword(savedFaculty.dob);
    savedFaculty.univId = this.generateUnivIdFaculty(
      savedFaculty.name, 
      savedFaculty.contactNo
    );

    const user = await UserService.createUser(
      savedFaculty.email,
      savedFaculty.password,
      savedFaculty.name,
      'faculty',
      savedFaculty.univId
    );
    
    savedFaculty.firebaseUid = user.firebaseUid;
    return await savedFaculty.save();
  }

  /**
   * Get student by roll number
   * @param {string} rollNo - Roll number
   * @returns {Promise<Object|null>} Student or null
   */
  async getStudentByRollNo(rollNo) {
    return await Student.findOne({
      where: { rollNo }
    });
  }

  /**
   * Update student
   * @param {string} rollNo - Roll number
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated student or null
   */
  async updateStudent(rollNo, updateData) {
    const student = await this.getStudentByRollNo(rollNo);
    
    if (!student) {
      return null;
    }

    return await student.update(updateData);
  }

  /**
   * Delete student
   * @param {string} rollNo - Roll number
   * @returns {Promise<boolean>} Success status
   */
  async deleteStudent(rollNo) {
    const student = await this.getStudentByRollNo(rollNo);
    
    if (!student) {
      return false;
    }

    await student.destroy();
    return true;
  }

  /**
   * Get faculty by email
   * @param {string} email - Faculty email
   * @returns {Promise<Object|null>} Faculty or null
   */
  async getFacultyByEmail(email) {
    return await Faculty.findOne({
      where: { email }
    });
  }

  /**
   * Update faculty
   * @param {string} email - Faculty email
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object|null>} Updated faculty or null
   */
  async updateFaculty(email, updateData) {
    const faculty = await this.getFacultyByEmail(email);
    
    if (!faculty) {
      return null;
    }

    return await faculty.update(updateData);
  }

  /**
   * Delete faculty
   * @param {string} email - Faculty email
   * @returns {Promise<boolean>} Success status
   */
  async deleteFaculty(email) {
    const faculty = await this.getFacultyByEmail(email);
    
    if (!faculty) {
      return false;
    }

    await faculty.destroy();
    return true;
  }

  /**
   * Get all students
   * @returns {Promise<Array>} Array of students
   */
  async getAllStudents() {
    return await Student.findAll({
      order: [['createdAt', 'DESC']]
    });
  }

  /**
   * Get all faculty
   * @returns {Promise<Array>} Array of faculty
   */
  async getAllFaculty() {
    return await Faculty.findAll({
      order: [['createdAt', 'DESC']]
    });
  }
}

module.exports = new AdminService();
