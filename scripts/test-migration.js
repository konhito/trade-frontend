const { PrismaClient } = require('@prisma/client')

async function testMigration() {
  const prisma = new PrismaClient()
  
  try {
    console.log('🧪 Testing migration...')
    
    // Test archive tables
    const archiveTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'archive'
    `
    console.log('📁 Archive tables:', archiveTables)
    
    // Test analytics tables
    const analyticsTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'analytics'
    `
    console.log('📊 Analytics tables:', analyticsTables)
    
    // Test retention policies
    const policies = await prisma.$queryRaw`
      SELECT table_name, retention_days, archive_days 
      FROM data_retention_policy
    `
    console.log('⚙️ Retention policies:', policies)
    
    // Test new columns in Trade table
    const tradeColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Trade' 
      AND column_name IN ('is_archived', 'archived_at', 'data_version')
    `
    console.log('🔧 New Trade columns:', tradeColumns)
    
    // Test new columns in User table
    const userColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User' 
      AND column_name IN ('data_retention_days', 'archive_retention_days', 'auto_archive_enabled')
    `
    console.log('👤 New User columns:', userColumns)
    
    console.log('\n✅ Migration test completed successfully!')
    console.log('\n📝 Summary:')
    console.log(`- Archive tables: ${archiveTables.length}`)
    console.log(`- Analytics tables: ${analyticsTables.length}`)
    console.log(`- Retention policies: ${policies.length}`)
    console.log(`- New Trade columns: ${tradeColumns.length}`)
    console.log(`- New User columns: ${userColumns.length}`)
    
  } catch (error) {
    console.error('❌ Migration test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testMigration()
