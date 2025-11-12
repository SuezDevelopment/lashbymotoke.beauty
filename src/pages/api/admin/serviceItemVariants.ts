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

// Admin API for variants nested under a specific service item
// Collection: service_categories -> services[] -> variants[]
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ status: false, message: 'Unauthorized' });

  const { categoryId, itemId, variantId } = req.query as { categoryId?: string; itemId?: string; variantId?: string };
  if (!categoryId) return res.status(400).json({ status: false, message: 'categoryId is required' });
  if (!itemId) return res.status(400).json({ status: false, message: 'itemId is required' });
  const catId = Array.isArray(categoryId) ? categoryId[0] : categoryId;
  const itId = Array.isArray(itemId) ? itemId[0] : itemId;
  const vId = Array.isArray(variantId) ? variantId[0] : variantId;

  try {
    await MongoDbConnection.connect();
    const col = await MongoDbConnection.getCollection('service_categories');

    if (req.method === 'GET') {
      if (!hasPerm(session, 'services:read')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const cat = await col.findOne({ _id: new ObjectId(String(catId)) });
      const items = Array.isArray(cat?.services) ? cat!.services : [];
      const item = items.find((s: any) => s.id === String(itId));
      const variants = Array.isArray(item?.variants) ? item!.variants : [];
      await logAudit(session, 'serviceItemVariants:list', 'variant', { categoryId: String(catId), itemId: String(itId), count: variants.length });
      return res.status(200).json({ status: true, items: variants });
    }

    if (req.method === 'POST') {
      if (!hasPerm(session, 'services:write')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const payload = req.body || {};
      if (!payload?.name || !payload?.slug) return res.status(400).json({ status: false, message: 'name and slug are required' });
      const now = new Date().toISOString();
      const variant = {
        id: payload.id || `${String(payload.slug)}-${Date.now()}`,
        name: String(payload.name),
        slug: String(payload.slug),
        basePrice: payload.basePrice || undefined,
        duration: payload.duration || undefined,
        tags: Array.isArray(payload.tags) ? payload.tags : undefined,
        images: Array.isArray(payload.images) ? payload.images : undefined,
        bookingLink: payload.bookingLink || undefined,
        position: typeof payload.position === 'number' ? payload.position : undefined,
        createdAt: now,
        updatedAt: now,
      };
      await col.updateOne(
        { _id: new ObjectId(String(catId)), 'services.id': String(itId) },
        { $push: { 'services.$.variants': variant }, $set: { updatedAt: now } } as any
      );
      await logAudit(session, 'serviceItemVariants:create', 'variant', { categoryId: String(catId), itemId: String(itId), name: variant.name, slug: variant.slug });
      await Cache.del(CACHE_KEYS.SERVICES_LIST);
      return res.status(200).json({ status: true, message: 'Created', item: variant });
    }

    if (req.method === 'PUT') {
      if (!hasPerm(session, 'services:write')) return res.status(403).json({ status: false, message: 'Forbidden' });
      if (!vId) return res.status(400).json({ status: false, message: 'variantId is required' });
      const update = req.body || {};
      const now = new Date().toISOString();
      const setOps: any = { 'services.$[s].variants.$[v].updatedAt': now };
      if (typeof update.name === 'string') setOps['services.$[s].variants.$[v].name'] = update.name;
      if (typeof update.slug === 'string') setOps['services.$[s].variants.$[v].slug'] = update.slug;
      if (update.basePrice) setOps['services.$[s].variants.$[v].basePrice'] = update.basePrice;
      if (update.duration) setOps['services.$[s].variants.$[v].duration'] = update.duration;
      if (Array.isArray(update.tags)) setOps['services.$[s].variants.$[v].tags'] = update.tags;
      if (Array.isArray(update.images)) setOps['services.$[s].variants.$[v].images'] = update.images;
      if (typeof update.bookingLink === 'string') setOps['services.$[s].variants.$[v].bookingLink'] = update.bookingLink;
      if (typeof update.position === 'number') setOps['services.$[s].variants.$[v].position'] = update.position;

      await col.updateOne(
        { _id: new ObjectId(String(catId)) },
        { $set: setOps } as any,
        { arrayFilters: [ { 's.id': String(itId) }, { 'v.id': String(vId) } ] } as any
      );
      await logAudit(session, 'serviceItemVariants:update', 'variant', { categoryId: String(catId), itemId: String(itId), variantId: String(vId) });
      await Cache.del(CACHE_KEYS.SERVICES_LIST);
      return res.status(200).json({ status: true, message: 'Updated' });
    }

    if (req.method === 'DELETE') {
      if (!hasPerm(session, 'services:write')) return res.status(403).json({ status: false, message: 'Forbidden' });
      if (!vId) return res.status(400).json({ status: false, message: 'variantId is required' });
      await col.updateOne(
        { _id: new ObjectId(String(catId)), 'services.id': String(itId) },
        { $pull: { 'services.$.variants': { id: String(vId) } } } as any
      );
      await logAudit(session, 'serviceItemVariants:delete', 'variant', { categoryId: String(catId), itemId: String(itId), variantId: String(vId) });
      await Cache.del(CACHE_KEYS.SERVICES_LIST);
      return res.status(200).json({ status: true, message: 'Deleted' });
    }

    return res.status(405).json({ status: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in admin serviceItemVariants:', error);
    return res.status(500).json({ status: false, message: 'Server error' });
  }
}