const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Database configuration
const pool = new Pool({
  host: 'localhost',
  port: 5434,
  database: 'platform_db',
  user: 'cas_user',
  password: 'secure_password'
});

async function initKnowledgeTable() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Initializing knowledge_content table...');
    
    // Read SQL file
    const sqlPath = path.join(__dirname, 'create-knowledge-table.sql');
    const sql = await fs.readFile(sqlPath, 'utf8');
    
    // Execute SQL
    await client.query(sql);
    
    console.log('✅ knowledge_content table created successfully!');
    
    // Verify table exists
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'knowledge_content'
    `);
    
    if (result.rows.length > 0) {
      console.log('✅ Table verification successful');
    } else {
      console.log('❌ Table verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error initializing knowledge_content table:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the initialization
initKnowledgeTable()
  .then(() => {
    console.log('🎉 Knowledge table initialization completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Knowledge table initialization failed:', error);
    process.exit(1);
  });
