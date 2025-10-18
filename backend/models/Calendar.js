const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Calendar = sequelize.define('Calendar', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'file_name'
  },
  fileData: {
    type: DataTypes.BLOB('long'),
    allowNull: false,
    field: 'file_data'
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'last_updated'
  }
}, {
  tableName: 'calendar',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Calendar;
