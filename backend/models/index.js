const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const Student = require('./Student');
const Faculty = require('./Faculty');
const Admin = require('./Admin');
const Attendance = require('./Attendance');
const Announcement = require('./Announcement');
const SubjectEnrollment = require('./SubjectEnrollment');
const Calendar = require('./Calendar');

// Define associations
const defineAssociations = () => {
  // SubjectEnrollment associations
  SubjectEnrollment.belongsTo(Faculty, {
    foreignKey: 'facultyEmail',
    targetKey: 'email',
    as: 'faculty'
  });

  Faculty.hasMany(SubjectEnrollment, {
    foreignKey: 'facultyEmail',
    sourceKey: 'email',
    as: 'taughtSubjects'
  });

  // Many-to-Many relationship between SubjectEnrollment and Student
  SubjectEnrollment.belongsToMany(Student, {
    through: 'subject_student_enrollment',
    foreignKey: 'subjectId',
    otherKey: 'studentEmail',
    as: 'enrolledStudents'
  });

  Student.belongsToMany(SubjectEnrollment, {
    through: 'subject_student_enrollment',
    foreignKey: 'studentEmail',
    otherKey: 'subjectId',
    as: 'enrolledStudents'
  });

  // Attendance associations
  Attendance.belongsTo(Student, {
    foreignKey: 'studentEmail',
    targetKey: 'email',
    as: 'student'
  });

  Attendance.belongsTo(Faculty, {
    foreignKey: 'facultyEmail',
    targetKey: 'email',
    as: 'faculty'
  });

  Attendance.belongsTo(SubjectEnrollment, {
    foreignKey: 'subjectId',
    targetKey: 'id',
    as: 'subject'
  });

  Student.hasMany(Attendance, {
    foreignKey: 'studentEmail',
    sourceKey: 'email',
    as: 'attendanceRecords'
  });

  Faculty.hasMany(Attendance, {
    foreignKey: 'facultyEmail',
    sourceKey: 'email',
    as: 'markedAttendances'
  });

  SubjectEnrollment.hasMany(Attendance, {
    foreignKey: 'subjectId',
    sourceKey: 'id',
    as: 'attendanceRecords'
  });
};

// Initialize associations
defineAssociations();

// Sync database (create tables if they don't exist)
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
  } catch (error) {
    console.error('Error synchronizing database:', error);
  }
};

module.exports = {
  sequelize,
  User,
  Student,
  Faculty,
  Admin,
  Attendance,
  Announcement,
  SubjectEnrollment,
  Calendar,
  syncDatabase
};
