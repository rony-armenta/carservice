// Run once to hash existing plain text passwords in the DB
// Usage: node scripts/hashPasswords.js

import bcrypt from 'bcrypt'
import pool   from '../db.js'
import dotenv from 'dotenv'

dotenv.config()

const SALT_ROUNDS = 12

async function run() {
  console.log('Fetching users...')
  const { rows: users } = await pool.query('SELECT id, email, password FROM users')

  for (const user of users) {
    if (user.password.startsWith('$2b$')) {
      console.log(`  already hashed, skipping: ${user.email}`)
      continue
    }
    const hashed = await bcrypt.hash(user.password, SALT_ROUNDS)
    await pool.query('UPDATE users SET password=$1 WHERE id=$2', [hashed, user.id])
    console.log(`  hashed: ${user.email}`)
  }

  console.log('\nDone! All passwords are now hashed.')
  await pool.end()
}

run().catch(err => { console.error(err); process.exit(1) })
