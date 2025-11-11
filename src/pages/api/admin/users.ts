import type { NextApiRequest, NextApiResponse } from "next";
import MongoDbConnection from "@/lib/db";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcrypt';
import { ROLE_PERMISSIONS } from '@/lib/auth';
import { logAudit } from '@/lib/audit';
import type { Role, Permission } from '@/lib/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ status: false, message: 'Unauthorized' });
  const permissions = (session as any).permissions || [];
  // Read access required for any method that returns data; specific checks per method below

  if (req.method === 'GET') {
    if (!permissions.includes('users:read')) return res.status(403).json({ status: false, message: 'Forbidden' });
    try {
      await MongoDbConnection.connect();
      const col = await MongoDbConnection.getCollection('users');
      const items = await col.find({}, { projection: { passwordHash: 0 } }).limit(200).toArray();
      await logAudit(session, 'users:list', 'user', { count: items.length });
      res.status(200).json({ status: true, items });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ status: false, message: 'Server error' });
    }
  } else if (req.method === 'POST') {
    if (!permissions.includes('users:write')) return res.status(403).json({ status: false, message: 'Forbidden' });
    try {
      await MongoDbConnection.connect();
      const col = await MongoDbConnection.getCollection('users');
      const body = req.body || {};
      const { email, name, role = 'viewer', password, permissions: perms } = body;
      if (!email || !password) return res.status(400).json({ status: false, message: 'email and password are required' });
      const exists = await col.findOne({ email });
      if (exists) return res.status(409).json({ status: false, message: 'User already exists' });
      const passwordHash = await bcrypt.hash(password, 10);
      const now = new Date().toISOString();
      const allowedRoles: Role[] = ['admin','manager','staff','viewer'];
      const rawRole: string = typeof role === 'string' ? role : 'viewer';
      const safeRole: Role = (allowedRoles.includes(rawRole as Role) ? (rawRole as Role) : 'viewer');
      const permissionsToSet: Permission[] = Array.isArray(perms) && perms.length > 0 ? (perms as Permission[]) : ROLE_PERMISSIONS[safeRole];
      await col.insertOne({ email, name, passwordHash, role: safeRole, permissions: permissionsToSet, createdAt: now, updatedAt: now });
      await logAudit(session, 'users:create', 'user', { email, role: safeRole, permissions: permissionsToSet });
      res.status(200).json({ status: true, message: 'Created' });
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ status: false, message: 'Server error' });
    }
  } else if (req.method === 'PUT') {
    if (!permissions.includes('users:write')) return res.status(403).json({ status: false, message: 'Forbidden' });
    try {
      await MongoDbConnection.connect();
      const col = await MongoDbConnection.getCollection('users');
      const { id } = req.query;
      const idParam = Array.isArray(id) ? id?.[0] : id;
      if (!idParam) return res.status(400).json({ status: false, message: 'id query param required' });
      const update = req.body || {};
      // Handle password reset via newPassword field
      if (update.newPassword) {
        const passwordHash = await bcrypt.hash(update.newPassword, 10);
        update.passwordHash = passwordHash;
        delete update.newPassword;
      }
      delete update.passwordHash; // Prevent setting passwordHash directly from body
      update.updatedAt = new Date().toISOString();
      await col.updateOne({ _id: new ObjectId(String(idParam)) }, { $set: update });
      const action = (req.body && req.body.newPassword) ? 'users:password-reset' : 'users:update';
      await logAudit(session, action, 'user', { resourceId: String(idParam), ...sanitizeUserUpdate(req.body || {}) });
      res.status(200).json({ status: true, message: 'Updated' });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ status: false, message: 'Server error' });
    }
  } else if (req.method === 'DELETE') {
    if (!permissions.includes('users:delete')) return res.status(403).json({ status: false, message: 'Forbidden' });
    try {
      await MongoDbConnection.connect();
      const col = await MongoDbConnection.getCollection('users');
      const { id } = req.query;
      const idParam = Array.isArray(id) ? id?.[0] : id;
      if (!idParam) return res.status(400).json({ status: false, message: 'id query param required' });
      await col.deleteOne({ _id: new ObjectId(String(idParam)) });
      await logAudit(session, 'users:delete', 'user', { resourceId: String(idParam) });
      res.status(200).json({ status: true, message: 'Deleted' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ status: false, message: 'Server error' });
    }
  } else {
    res.status(405).json({ status: false, message: 'Method not allowed' });
  }
}

function sanitizeUserUpdate(update: any) {
  const copy: any = {};
  if (typeof update?.name === 'string') copy.name = update.name;
  if (typeof update?.role === 'string') copy.role = update.role;
  if (Array.isArray(update?.permissions)) copy.permissions = update.permissions;
  return copy;
}