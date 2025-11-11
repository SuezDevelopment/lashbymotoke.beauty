#!/usr/bin/env node
// Create or update a root admin user in MongoDB
// Usage:
//   ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD=SuperSecret npm run seed:admin
// or
//   node scripts/create-admin.js --email admin@example.com --password SuperSecret --name "Root Admin"

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function main() {
  const args = process.argv.slice(2);
  const getArg = (key) => {
    const idx = args.findIndex(a => a === `--${key}`);
    if (idx !== -1) return args[idx + 1];
    return process.env[`ADMIN_${key.toUpperCase()}`];
  };

  const email = getArg('email');
  const password = getArg('password');
  const name = getArg('name') || 'Root Admin';
  const role = getArg('role') || 'admin';

  if (!email || !password) {
    console.error('ERROR: email and password are required. Pass via --email/--password or ADMIN_EMAIL/ADMIN_PASSWORD env vars.');
    process.exit(1);
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGO_DB_NAME;
  if (!uri || !dbName) {
    console.error('ERROR: MONGODB_URI and MONGO_DB_NAME must be set in environment.');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(dbName);
    const users = db.collection('users');
    const existing = await users.findOne({ email });
    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();
    const defaultPermissions = ['users:read','users:write','users:delete','services:read','services:write','trainings:read','trainings:write','applications:read','applications:write','applications:export','bookings:read','bookings:write','analytics:read','templates:read','templates:write','audit:read'];

    if (!existing) {
      await users.insertOne({
        email,
        name,
        passwordHash,
        role,
        permissions: defaultPermissions,
        createdAt: now,
        updatedAt: now,
      });
      console.log(`Created admin user: ${email}`);
    } else {
      await users.updateOne({ email }, { $set: { passwordHash, role, permissions: existing.permissions || defaultPermissions, name, updatedAt: now } });
      console.log(`Updated admin user: ${email}`);
    }
    console.log('Done. You can now sign in at /admin/login using the email and password provided.');
  } catch (err) {
    console.error('Failed to create/update admin:', err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main();