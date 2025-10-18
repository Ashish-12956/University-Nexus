const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Faculty = sequelize.define('Faculty', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  univId: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    field: 'univ_id'
  },
  firebaseUid: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true,
    field: 'firebase_uid'
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
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
  image: {
    type: DataTypes.BLOB('long'),
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'faculty',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Faculty;
