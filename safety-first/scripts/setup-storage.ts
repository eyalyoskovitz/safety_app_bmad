/**
 * Setup script for Supabase Storage bucket
 * Run this once to create the incident-photos bucket
 *
 * Usage: npx tsx scripts/setup-storage.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

// ES Module __dirname equivalent
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL!
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function setupStorageBucket() {
  console.log('🔧 Setting up incident-photos storage bucket...\n')

  try {
    // Check if bucket already exists
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(bucket => bucket.id === 'incident-photos')

    if (bucketExists) {
      console.log('✅ Bucket "incident-photos" already exists')
    } else {
      // Create bucket
      const { error } = await supabase.storage.createBucket('incident-photos', {
        public: true,
        fileSizeLimit: 10485760 // 10MB
      })

      if (error) {
        console.error('❌ Failed to create bucket:', error.message)
        console.log('\n📝 Note: You may need to create the bucket manually via Supabase Dashboard:')
        console.log('   1. Go to: https://supabase.com/dashboard/project/iwgbxmidvqumuxauzerv/storage/buckets')
        console.log('   2. Click "New bucket"')
        console.log('   3. Name: incident-photos')
        console.log('   4. Public: Yes')
        console.log('   5. File size limit: 10MB')
        console.log('\n   OR run the migration file directly in SQL Editor:')
        console.log('   supabase/migrations/20260104000000_create_incident_photos_bucket.sql')
        process.exit(1)
      }

      console.log('✅ Created bucket "incident-photos"')
    }

    console.log('\n✨ Storage bucket setup complete!')
    console.log('   - Bucket: incident-photos')
    console.log('   - Public: Yes')
    console.log('   - File size limit: 10MB')
    console.log('   - Location: Supabase Storage')

  } catch (error) {
    console.error('❌ Setup failed:', error)
    console.log('\n📝 Please apply the migration manually via Supabase Dashboard SQL Editor:')
    console.log('   File: supabase/migrations/20260104000000_create_incident_photos_bucket.sql')
    process.exit(1)
  }
}

setupStorageBucket()
