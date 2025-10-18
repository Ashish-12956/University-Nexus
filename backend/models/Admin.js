const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Admin = sequelize.define('Admin', {
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
    field: 'univ_id'
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true
    }
  },
  dob: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true
  },
  firebaseUid: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'firebase_uid'
  }
}, {
  tableName: 'admin',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Admin;
