const { Sequelize } = require('sequelize');
require('dotenv').config();

// Validate required environment variables
if (!process.env.DB_PASSWORD) {
  console.warn('Warning: DB_PASSWORD environment variable is not set. Database connection may fail.');
}

const sequelize = new Sequelize({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  database: process.env.DB_NAME || 'university',
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD, // Removed hardcoded password for security
  dialect: 'mysql',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

// Test the connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection has been established successfully.');
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  }
};

module.exports = { sequelize, testConnection };
