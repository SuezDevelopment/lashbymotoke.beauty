import MongoDbConnection from '@/lib/db';
import type { User, Role, Permission } from '@/lib/types';
import bcrypt from 'bcrypt';

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ['users:read','users:write','users:delete','services:read','services:write','trainings:read','trainings:write','applications:read','applications:write','applications:export','bookings:read','bookings:write','analytics:read','templates:read','templates:write','resources:read','resources:write','audit:read'],
  manager: ['users:read','services:read','services:write','trainings:read','trainings:write','applications:read','applications:write','bookings:read','analytics:read','templates:read','resources:read','resources:write','audit:read'],
  staff: ['services:read','trainings:read','applications:read','bookings:read','resources:read'],
  viewer: ['analytics:read'],
};

export async function getUserByEmail(email: string): Promise<User | null> {
  await MongoDbConnection.connect();
  const users = await MongoDbConnection.getCollection('users');
  const u = await users.findOne({ email });
  if (!u) return null;
  const user: User = {
    _id: u._id?.toString(),
    email: u.email,
    name: u.name,
    passwordHash: u.passwordHash,
    role: u.role || 'viewer',
    permissions: u.permissions || ROLE_PERMISSIONS[(u.role as Role) || 'viewer'],
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  };
  return user;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}