import type { NextApiRequest, NextApiResponse } from "next";
import MongoDbConnection from "@/lib/db";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { ObjectId } from 'mongodb';
import type { Resource } from '@/lib/types';
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
    const col = await MongoDbConnection.getCollection('resources');

    if (req.method === 'GET') {
      if (!hasPerm(session, 'resources:read')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const { q, category, tag, status, page, limit } = req.query as Record<string, string | undefined>;
      const filter: any = {};
      if (typeof status === 'string' && status) filter.status = status;
      if (typeof category === 'string' && category) filter.category = category;
      if (typeof tag === 'string' && tag) filter.tags = { $in: [tag] };
      if (typeof q === 'string' && q) {
        filter.$or = [
          { title: { $regex: q, $options: 'i' } },
          { summary: { $regex: q, $options: 'i' } },
          { content: { $regex: q, $options: 'i' } },
        ];
      }
      const lim = Math.max(1, Math.min(200, Number(limit) || 50));
      const pg = Math.max(1, Number(page) || 1);
      const skip = (pg - 1) * lim;
      const items = await col.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).toArray();
      await logAudit(session, 'resources:list', 'resource', { count: items.length, filter });
      return res.status(200).json({ status: true, items, page: pg, limit: lim });
    }

    if (req.method === 'POST') {
      if (!hasPerm(session, 'resources:write')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const body: Partial<Resource> = req.body || {};
      if (!body.title || !body.slug) return res.status(400).json({ status: false, message: 'title and slug are required' });
      const now = new Date().toISOString();
      const doc: Resource = {
        title: String(body.title),
        slug: String(body.slug),
        summary: body.summary || '',
        content: body.content || '',
        heroImage: body.heroImage || '',
        category: body.category || 'General',
        tags: Array.isArray(body.tags) ? body.tags : [],
        status: body.status || 'draft',
        ctaLabel: body.ctaLabel || '',
        ctaHref: body.ctaHref || '',
        authorEmail: (session as any)?.user?.email,
        createdAt: now,
        updatedAt: now,
      };
      await col.insertOne(doc as any);
      await logAudit(session, 'resources:create', 'resource', { title: doc.title, slug: doc.slug, status: doc.status });
      return res.status(200).json({ status: true, message: 'Created' });
    }

    if (req.method === 'PUT') {
      if (!hasPerm(session, 'resources:write')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const { id } = req.query;
      const idParam = Array.isArray(id) ? id?.[0] : id;
      if (!idParam) return res.status(400).json({ status: false, message: 'id query param required' });
      const update: Partial<Resource> = req.body || {};
      const safeUpdate: any = sanitizeResourceUpdate(update);
      safeUpdate.updatedAt = new Date().toISOString();
      await col.updateOne({ _id: new ObjectId(String(idParam)) }, { $set: safeUpdate });
      await logAudit(session, 'resources:update', 'resource', { resourceId: String(idParam), ...safeUpdate });
      return res.status(200).json({ status: true, message: 'Updated' });
    }

    if (req.method === 'DELETE') {
      if (!hasPerm(session, 'resources:write')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const { id } = req.query;
      const idParam = Array.isArray(id) ? id?.[0] : id;
      if (!idParam) return res.status(400).json({ status: false, message: 'id query param required' });
      await col.deleteOne({ _id: new ObjectId(String(idParam)) });
      await logAudit(session, 'resources:delete', 'resource', { resourceId: String(idParam) });
      return res.status(200).json({ status: true, message: 'Deleted' });
    }

    return res.status(405).json({ status: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in admin resources API:', error);
    return res.status(500).json({ status: false, message: 'Server error' });
  }
}

function sanitizeResourceUpdate(update: Partial<Resource>) {
  const copy: any = {};
  if (typeof update.title === 'string') copy.title = update.title;
  if (typeof update.slug === 'string') copy.slug = update.slug;
  if (typeof update.summary === 'string') copy.summary = update.summary;
  if (typeof update.content === 'string') copy.content = update.content;
  if (typeof update.heroImage === 'string') copy.heroImage = update.heroImage;
  if (typeof update.category === 'string') copy.category = update.category;
  if (Array.isArray(update.tags)) copy.tags = update.tags;
  if (typeof update.status === 'string') copy.status = update.status;
  if (typeof update.ctaLabel === 'string') copy.ctaLabel = update.ctaLabel;
  if (typeof update.ctaHref === 'string') copy.ctaHref = update.ctaHref;
  return copy;
}