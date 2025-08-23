require('dotenv').config({ path: __dirname + '/../.env' });

async function checkTemplates() {
  try {
    console.log('🔍 Checking default email templates...\n');
    
    // Use the same getPool function as the server
    const { Pool } = require('pg');
    
    const pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5434,
      database: process.env.DB_NAME || 'platform_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres'
    });
    
    const result = await pool.query(`
      SELECT process_name, subject, is_active, created_at 
      FROM default_email_templates 
      ORDER BY process_name
    `);
    
    if (result.rows.length === 0) {
      console.log('❌ No default templates found!');
      console.log('💡 This might mean the database schema needs to be initialized.');
      return;
    }
    
    console.log(`✅ Found ${result.rows.length} default templates:\n`);
    
    result.rows.forEach(template => {
      console.log(`📧 ${template.process_name}:`);
      console.log(`   Subject: ${template.subject}`);
      console.log(`   Active: ${template.is_active ? '✅' : '❌'}`);
      console.log(`   Created: ${template.created_at}`);
      console.log('');
    });
    
    // Check parameters
    console.log('🔍 Checking template parameters...\n');
    
    const paramResult = await pool.query(`
      SELECT dt.process_name, etp.parameter_name, etp.parameter_type, etp.is_required
      FROM default_email_templates dt
      LEFT JOIN email_template_parameters etp ON dt.id = etp.template_id
      ORDER BY dt.process_name, etp.parameter_name
    `);
    
    if (paramResult.rows.length === 0) {
      console.log('❌ No template parameters found!');
      console.log('💡 This might mean the database schema needs to be initialized.');
    } else {
      console.log(`✅ Found ${paramResult.rows.length} template parameters:\n`);
      
      let currentProcess = '';
      paramResult.rows.forEach(param => {
        if (param.process_name !== currentProcess) {
          currentProcess = param.process_name;
          console.log(`📋 ${currentProcess}:`);
        }
        if (param.parameter_name) {
          console.log(`   - ${param.parameter_name} (${param.parameter_type}) ${param.is_required ? '[Required]' : '[Optional]'}`);
        }
      });
    }
    
    await pool.end();
    
  } catch (error) {
    console.error('❌ Error checking templates:', error);
    console.log('\n💡 This might be a database connection issue. The templates should be created when the server starts.');
  }
}

checkTemplates();
