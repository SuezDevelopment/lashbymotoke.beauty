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

// Admin API for nested service items under a service category
// Collection: service_categories
// CRUD on services[] array inside a category document
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ status: false, message: 'Unauthorized' });

  const { categoryId } = req.query as { categoryId?: string };
  if (!categoryId) return res.status(400).json({ status: false, message: 'categoryId is required' });
  const catId = Array.isArray(categoryId) ? categoryId[0] : categoryId;

  try {
    await MongoDbConnection.connect();
    const col = await MongoDbConnection.getCollection('service_categories');

    if (req.method === 'GET') {
      if (!hasPerm(session, 'services:read')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const cat = await col.findOne({ _id: new ObjectId(String(catId)) });
      const items = Array.isArray(cat?.services) ? cat!.services : [];
      await logAudit(session, 'serviceItems:list', 'serviceItem', { categoryId: String(catId), count: items.length });
      return res.status(200).json({ status: true, items });
    }

    if (req.method === 'POST') {
      if (!hasPerm(session, 'services:write')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const payload = req.body || {};
      if (!payload?.name || !payload?.slug) return res.status(400).json({ status: false, message: 'name and slug are required' });
      const now = new Date().toISOString();
      const catForLen = await col.findOne({ _id: new ObjectId(String(catId)) });
      const currentLen = Array.isArray(catForLen?.services) ? catForLen!.services.length : 0;
      const item = {
        id: payload.id || `${String(payload.slug)}-${Date.now()}`,
        name: String(payload.name),
        slug: String(payload.slug),
        summary: payload.summary || '',
        basePrice: payload.basePrice || undefined,
        duration: payload.duration || undefined,
        tags: Array.isArray(payload.tags) ? payload.tags : undefined,
        images: Array.isArray(payload.images) ? payload.images : undefined,
        bookingLink: payload.bookingLink || undefined,
        highlights: Array.isArray(payload.highlights) ? payload.highlights : undefined,
        faqs: Array.isArray(payload.faqs) ? payload.faqs : undefined,
        position: typeof payload.position === 'number' ? payload.position : currentLen,
        createdAt: now,
        updatedAt: now,
      };
      await col.updateOne(
        { _id: new ObjectId(String(catId)) },
        { $push: { services: item }, $set: { updatedAt: now } } as any
      );
      await logAudit(session, 'serviceItems:create', 'serviceItem', { categoryId: String(catId), name: item.name, slug: item.slug });
      await Cache.del(CACHE_KEYS.SERVICES_LIST);
      return res.status(200).json({ status: true, message: 'Created', item });
    }

    if (req.method === 'PUT') {
      if (!hasPerm(session, 'services:write')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const { itemId } = req.query as { itemId?: string };
      if (!itemId) return res.status(400).json({ status: false, message: 'itemId is required' });
      const idParam = Array.isArray(itemId) ? itemId[0] : itemId;
      const update = req.body || {};
      const now = new Date().toISOString();

      // Build $set paths for partial update on matched array element
      const setOps: any = { 'services.$.updatedAt': now };
      if (typeof update.name === 'string') setOps['services.$.name'] = update.name;
      if (typeof update.slug === 'string') setOps['services.$.slug'] = update.slug;
      if (typeof update.summary === 'string') setOps['services.$.summary'] = update.summary;
      if (update.basePrice) setOps['services.$.basePrice'] = update.basePrice;
      if (update.duration) setOps['services.$.duration'] = update.duration;
      if (Array.isArray(update.tags)) setOps['services.$.tags'] = update.tags;
      if (Array.isArray(update.images)) setOps['services.$.images'] = update.images;
      if (typeof update.bookingLink === 'string') setOps['services.$.bookingLink'] = update.bookingLink;
      if (Array.isArray(update.highlights)) setOps['services.$.highlights'] = update.highlights;
      if (Array.isArray(update.faqs)) setOps['services.$.faqs'] = update.faqs;
      if (typeof update.position === 'number') setOps['services.$.position'] = update.position;

      await col.updateOne(
        { _id: new ObjectId(String(catId)), 'services.id': String(idParam) },
        { $set: setOps } as any
      );
      await logAudit(session, 'serviceItems:update', 'serviceItem', { categoryId: String(catId), itemId: String(idParam) });
      await Cache.del(CACHE_KEYS.SERVICES_LIST);
      return res.status(200).json({ status: true, message: 'Updated' });
    }

    if (req.method === 'DELETE') {
      if (!hasPerm(session, 'services:write')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const { itemId } = req.query as { itemId?: string };
      if (!itemId) return res.status(400).json({ status: false, message: 'itemId is required' });
      const idParam = Array.isArray(itemId) ? itemId[0] : itemId;
      await col.updateOne(
        { _id: new ObjectId(String(catId)) },
        { $pull: { services: { id: String(idParam) } } } as any
      );
      await logAudit(session, 'serviceItems:delete', 'serviceItem', { categoryId: String(catId), itemId: String(idParam) });
      await Cache.del(CACHE_KEYS.SERVICES_LIST);
      return res.status(200).json({ status: true, message: 'Deleted' });
    }

    return res.status(405).json({ status: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in admin serviceItems:', error);
    return res.status(500).json({ status: false, message: 'Server error' });
  }
}