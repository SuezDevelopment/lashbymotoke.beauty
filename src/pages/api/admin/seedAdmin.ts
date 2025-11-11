import type { NextApiRequest, NextApiResponse } from "next";
import MongoDbConnection from "@/lib/db";
import bcrypt from 'bcrypt';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ status: false, message: 'Method not allowed' });

  const seedToken = req.headers['x-seed-token'];
  const hasToken = !!process.env.ADMIN_SEED_TOKEN;
  const isDev = process.env.NODE_ENV !== 'production';
  if (hasToken) {
    if (seedToken !== process.env.ADMIN_SEED_TOKEN) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }
  } else if (!isDev) {
    // In production, token must be set
    return res.status(401).json({ status: false, message: 'Unauthorized' });
  }

  const { email, password, name } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ status: false, message: 'Email and password required' });
  }
  try {
    await MongoDbConnection.connect();
    const col = await MongoDbConnection.getCollection('users');
    const existing = await col.findOne({ email });
    if (existing) return res.status(409).json({ status: false, message: 'User already exists' });
    const passwordHash = await bcrypt.hash(password, 10);
    const doc = {
      email,
      name: name || email,
      passwordHash,
      role: 'admin',
      permissions: ['users:read','users:write','users:delete','services:read','services:write','trainings:read','trainings:write','applications:read','applications:write','applications:export','bookings:read','bookings:write','analytics:read','templates:read','templates:write','audit:read'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await col.insertOne(doc);
    res.status(200).json({ status: true, message: 'Admin seeded successfully' });
  } catch (error) {
    console.error('Error seeding admin:', error);
    res.status(500).json({ status: false, message: 'Server error' });
  }
}