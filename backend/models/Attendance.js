const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Attendance = sequelize.define('Attendance', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  studentEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'student_email',
    references: {
      model: 'students',
      key: 'email'
    }
  },
  facultyEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'faculty_email',
    references: {
      model: 'faculty',
      key: 'email'
    }
  },
  subjectId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    field: 'subject_id',
    references: {
      model: 'subject_enrollments',
      key: 'id'
    }
  },
  date: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  present: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  remarks: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'attendance',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Attendance;
