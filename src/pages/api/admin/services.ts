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
    const col = await MongoDbConnection.getCollection('service_categories');

    if (req.method === 'GET') {
      if (!hasPerm(session, 'services:read')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const cached = await Cache.get(CACHE_KEYS.SERVICES).catch(() => null);
      if (cached && Array.isArray(cached)) {
        return res.status(200).json({ status: true, items: cached });
      }
      const items = await col.find({}).sort({ name: 1 }).limit(500).toArray();
      await Cache.set(CACHE_KEYS.SERVICES, items, 300).catch(() => {});
      await logAudit(session, 'services:list', 'service', { count: items.length });
      return res.status(200).json({ status: true, items });
    }

    if (req.method === 'POST') {
      if (!hasPerm(session, 'services:write')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const doc = req.body || {};
      if (!doc.name || !doc.slug) return res.status(400).json({ status: false, message: 'name and slug are required' });
      doc.createdAt = new Date().toISOString();
      doc.updatedAt = new Date().toISOString();
      await col.insertOne(doc);
      await logAudit(session, 'services:create', 'service', { name: doc.name, slug: doc.slug });
      await Cache.del(CACHE_KEYS.SERVICES);
      return res.status(200).json({ status: true, message: 'Created' });
    }

    if (req.method === 'PUT') {
      if (!hasPerm(session, 'services:write')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const { id } = req.query;
      const update = req.body || {};
      if (!id) return res.status(400).json({ status: false, message: 'id query param required' });
      const idParam = Array.isArray(id) ? id[0] : id;
      update.updatedAt = new Date().toISOString();
      await col.updateOne({ _id: new ObjectId(String(idParam)) }, { $set: update });
      await logAudit(session, 'services:update', 'service', { resourceId: String(idParam), ...sanitizeService(update) });
      await Cache.del(CACHE_KEYS.SERVICES);
      return res.status(200).json({ status: true, message: 'Updated' });
    }

    if (req.method === 'DELETE') {
      if (!hasPerm(session, 'services:write')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const { id } = req.query;
      if (!id) return res.status(400).json({ status: false, message: 'id query param required' });
      const idParam = Array.isArray(id) ? id[0] : id;
      await col.deleteOne({ _id: new ObjectId(String(idParam)) });
      await logAudit(session, 'services:delete', 'service', { resourceId: String(idParam) });
      await Cache.del(CACHE_KEYS.SERVICES);
      return res.status(200).json({ status: true, message: 'Deleted' });
    }

    return res.status(405).json({ status: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in admin services:', error);
    return res.status(500).json({ status: false, message: 'Server error' });
  }
}

function sanitizeService(update: any) {
  const copy: any = {};
  if (typeof update?.name === 'string') copy.name = update.name;
  if (typeof update?.slug === 'string') copy.slug = update.slug;
  return copy;
}