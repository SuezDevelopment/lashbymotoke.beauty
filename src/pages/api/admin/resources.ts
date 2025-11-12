import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { logAudit } from '@/lib/audit';
import MongoDb, { getResourceCollection, listResources, createResource, updateResource } from '@/lib/db';
import type { Resource } from '@/lib/types';
import { ObjectId } from 'mongodb';

function hasPerm(session: any, perm: string) {
  const permissions = (session as any)?.permissions || [];
  return permissions.includes(perm);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ status: false, message: 'Unauthorized' });

  try {
    if (req.method === 'GET') {
      if (!hasPerm(session, 'resources:read')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const { query = '', status = '', category = '', tag = '', limit = '20', offset = '0' } = req.query;
      const data = await listResources({
        query: String(query) || undefined,
        status: String(status) || undefined,
        category: String(category) || undefined,
        tag: String(tag) || undefined,
        limit: Number(limit) || 20,
        offset: Number(offset) || 0,
      });
      await logAudit(session, 'resources:list', 'resource', { query, status, category, tag });
      return res.status(200).json({ status: true, items: data.items, total: data.total });
    }

    if (req.method === 'POST') {
      if (!hasPerm(session, 'resources:write')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const payload: Partial<Resource> = req.body || {};
      if (!payload.title || !payload.slug) return res.status(400).json({ status: false, message: 'title and slug are required' });
      const doc = await createResource({
        title: payload.title,
        slug: payload.slug,
        summary: payload.summary,
        content: payload.content,
        heroImage: payload.heroImage,
        category: payload.category,
        tags: payload.tags,
        status: payload.status,
        ctaLabel: payload.ctaLabel,
        ctaHref: payload.ctaHref,
      });
      await logAudit(session, 'resources:create', 'resource', { title: doc.title, slug: doc.slug });
      return res.status(200).json({ status: true, message: 'Created', item: doc });
    }

    if (req.method === 'PUT') {
      if (!hasPerm(session, 'resources:write')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const { id } = req.query;
      if (!id) return res.status(400).json({ status: false, message: 'id query param required' });
      const idParam = Array.isArray(id) ? id[0] : id;
      const updates: Partial<Resource> = req.body || {};
      const updated = await updateResource(String(idParam), updates);
      await logAudit(session, 'resources:update', 'resource', { resourceId: String(idParam), updates });
      return res.status(200).json({ status: true, message: 'Updated', item: updated });
    }

    if (req.method === 'DELETE') {
      if (!hasPerm(session, 'resources:write')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const { id } = req.query;
      if (!id) return res.status(400).json({ status: false, message: 'id query param required' });
      const idParam = Array.isArray(id) ? id[0] : id;
      const col = await getResourceCollection();
      await col.deleteOne({ _id: new ObjectId(String(idParam)) } as any);
      await logAudit(session, 'resources:delete', 'resource', { resourceId: String(idParam) });
      return res.status(200).json({ status: true, message: 'Deleted' });
    }

    return res.status(405).json({ status: false, message: 'Method Not Allowed' });
  } catch (err: any) {
    console.error('Admin resources API error:', err);
    return res.status(500).json({ status: false, message: 'Server error', error: err?.message });
  }
}