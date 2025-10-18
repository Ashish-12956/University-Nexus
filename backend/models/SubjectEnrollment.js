const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const SubjectEnrollment = sequelize.define('SubjectEnrollment', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  subjectName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'subject_name'
  },
  subjectCode: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'subject_code'
  },
  credits: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  facultyEmail: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'faculty_email',
    references: {
      model: 'faculty',
      key: 'email'
    }
  }
}, {
  tableName: 'subject_enrollments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = SubjectEnrollment;
