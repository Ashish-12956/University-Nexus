const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  course: {
    type: DataTypes.STRING,
    allowNull: false
  },
  branch: {
    type: DataTypes.STRING,
    allowNull: false
  },
  semester: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  enrollmentCode: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'enrollment_code'
  },
  enrollmentCompleted: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    field: 'enrollment_completed'
  },
  rollNo: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'roll_no'
  },
  firebaseUid: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    field: 'firebase_uid'
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  contactNo: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'contact_no'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other'),
    allowNull: true
  },
  nationality: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bloodGroup: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'blood_group'
  },
  parentContactNo: {
    type: DataTypes.BIGINT,
    allowNull: true,
    field: 'parent_contact_no'
  },
  parentName: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'parent_name'
  },
  parentOccupation: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'parent_occupation'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  univId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    field: 'univ_id'
  },
  stuImage: {
    type: DataTypes.BLOB('long'),
    allowNull: true,
    field: 'stu_image'
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'students',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Student;
