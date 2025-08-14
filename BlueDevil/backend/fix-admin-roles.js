const { Pool } = require('pg');

// Database configuration - adjust these values if needed
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'salesfive_platform',
  user: 'postgres',
  password: 'postgres'
});

async function fixAdminRoles() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting admin role update...');
    
    // First, let's see what users we have
    console.log('\n📊 Current users before update:');
    const beforeResult = await client.query(`
      SELECT id, email, username, global_role, is_active 
      FROM users 
      ORDER BY created_at
    `);
    
    beforeResult.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.username}): ${user.global_role} ${user.is_active ? '✅' : '❌'}`);
    });
    
    // Update admin users to system_admin
    console.log('\n🔄 Updating admin roles...');
    const updateResult = await client.query(`
      UPDATE users 
      SET global_role = 'system_admin' 
      WHERE global_role = 'admin'
    `);
    
    console.log(`✅ Updated ${updateResult.rowCount} users from 'admin' to 'system_admin'`);
    
    // Show users after update
    console.log('\n📊 Users after update:');
    const afterResult = await client.query(`
      SELECT id, email, username, global_role, is_active 
      FROM users 
      ORDER BY created_at
    `);
    
    afterResult.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.username}): ${user.global_role} ${user.is_active ? '✅' : '❌'}`);
    });
    
    // Show statistics
    const statsResult = await client.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN global_role = 'system_admin' THEN 1 END) as system_admins,
        COUNT(CASE WHEN global_role = 'project_admin' THEN 1 END) as project_admins,
        COUNT(CASE WHEN global_role = 'user' THEN 1 END) as regular_users,
        COUNT(CASE WHEN global_role = 'guest' THEN 1 END) as guests
      FROM users
    `);
    
    const stats = statsResult.rows[0];
    console.log('\n📈 Final user distribution:');
    console.log(`  Total users: ${stats.total_users}`);
    console.log(`  System Admins: ${stats.system_admins}`);
    console.log(`  Project Admins: ${stats.project_admins}`);
    console.log(`  Regular Users: ${stats.regular_users}`);
    console.log(`  Guests: ${stats.guests}`);
    
    console.log('\n✅ Admin role update completed successfully!');
    
  } catch (error) {
    console.error('❌ Error updating admin roles:', error);
    
    // Try to provide helpful error information
    if (error.code === 'ECONNREFUSED') {
      console.error('\n💡 Database connection failed. Please check:');
      console.error('  1. Is PostgreSQL running?');
      console.error('  2. Are the database credentials correct?');
      console.error('  3. Is the database "salesfive_platform" created?');
    } else if (error.code === '28P01') {
      console.error('\n💡 Authentication failed. Please check database credentials.');
    } else if (error.code === '3D000') {
      console.error('\n💡 Database "salesfive_platform" does not exist.');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the update
fixAdminRoles();
