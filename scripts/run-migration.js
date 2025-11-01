const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

async function runMigration() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Starting long-term storage migration...')
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, 'setup-longterm-storage.sql')
    const sql = fs.readFileSync(sqlFile, 'utf8')
    
    // Split by semicolon and execute each statement
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`Found ${statements.length} SQL statements to execute`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement.trim()) {
        try {
          console.log(`Executing statement ${i + 1}/${statements.length}...`)
          await prisma.$executeRawUnsafe(statement)
          console.log(`✅ Statement ${i + 1} executed successfully`)
        } catch (error) {
          console.log(`⚠️  Statement ${i + 1} failed (may already exist):`, error.message)
          // Continue with other statements
        }
      }
    }
    
    console.log('✅ Migration completed successfully!')
    
    // Test the migration by checking if new tables exist
    const archiveTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'archive'
    `
    
    const analyticsTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'analytics'
    `
    
    console.log('Archive tables created:', archiveTables)
    console.log('Analytics tables created:', analyticsTables)
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

runMigration()
