const { sequelize, syncDatabase } = require('../models');

async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    
    // Test connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync database (create tables)
    await syncDatabase();
    console.log('Database synchronized successfully.');
    
    // Close connection
    await sequelize.close();
    console.log('Database initialization completed.');
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  initializeDatabase();
}

module.exports = initializeDatabase;
