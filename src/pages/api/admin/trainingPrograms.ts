import type { NextApiRequest, NextApiResponse } from "next";
import MongoDbConnection from "@/lib/db";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { Cache, CACHE_KEYS } from '@/lib/cache';
import { ObjectId } from 'mongodb';
import { logAudit } from '@/lib/audit';

function hasPerm(session: any, perm: string) {
  const permissions = (session as any)?.permissions || [];
  return permissions.includes(perm);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ status: false, message: 'Unauthorized' });

  try {
    await MongoDbConnection.connect();
    const col = await MongoDbConnection.getCollection('training_programs');

    if (req.method === 'GET') {
      if (!hasPerm(session, 'trainings:read')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const cached = Cache.get<any[]>(CACHE_KEYS.TRAINING_PROGRAMS);
      if (cached && Array.isArray(cached)) {
        return res.status(200).json({ status: true, items: cached });
      }
      const items = await col.find({}).sort({ name: 1 }).limit(500).toArray();
      Cache.set(CACHE_KEYS.TRAINING_PROGRAMS, items, 300);
      await logAudit(session, 'trainings:list', 'training', { count: items.length });
      return res.status(200).json({ status: true, items });
    }

    if (req.method === 'POST') {
      if (!hasPerm(session, 'trainings:write')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const doc = req.body || {};
      if (!doc.name || !doc.type) return res.status(400).json({ status: false, message: 'name and type are required' });
      doc.createdAt = new Date().toISOString();
      doc.updatedAt = new Date().toISOString();
      await col.insertOne(doc);
      await logAudit(session, 'trainings:create', 'training', { name: doc.name, type: doc.type });
      await Cache.del(CACHE_KEYS.TRAINING_PROGRAMS);
      return res.status(200).json({ status: true, message: 'Created' });
    }

    if (req.method === 'PUT') {
      if (!hasPerm(session, 'trainings:write')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const { id } = req.query;
      const update = req.body || {};
      if (!id) return res.status(400).json({ status: false, message: 'id query param required' });
      const idParam = Array.isArray(id) ? id[0] : id;
      update.updatedAt = new Date().toISOString();
      await col.updateOne({ _id: new ObjectId(String(idParam)) }, { $set: update });
      await logAudit(session, 'trainings:update', 'training', { resourceId: String(idParam), ...sanitizeTraining(update) });
      await Cache.del(CACHE_KEYS.TRAINING_PROGRAMS);
      return res.status(200).json({ status: true, message: 'Updated' });
    }

    if (req.method === 'DELETE') {
      if (!hasPerm(session, 'trainings:write')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const { id } = req.query;
      if (!id) return res.status(400).json({ status: false, message: 'id query param required' });
      const idParam = Array.isArray(id) ? id[0] : id;
      await col.deleteOne({ _id: new ObjectId(String(idParam)) });
      await logAudit(session, 'trainings:delete', 'training', { resourceId: String(idParam) });
      await Cache.del(CACHE_KEYS.TRAINING_PROGRAMS);
      return res.status(200).json({ status: true, message: 'Deleted' });
    }

    return res.status(405).json({ status: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in admin training programs:', error);
    return res.status(500).json({ status: false, message: 'Server error' });
  }
}

function sanitizeTraining(update: any) {
  const copy: any = {};
  if (typeof update?.name === 'string') copy.name = update.name;
  if (typeof update?.type === 'string') copy.type = update.type;
  return copy;
}