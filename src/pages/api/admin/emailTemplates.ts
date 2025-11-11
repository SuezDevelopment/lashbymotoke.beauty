import type { NextApiRequest, NextApiResponse } from "next";
import MongoDbConnection from "@/lib/db";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { Cache, CACHE_KEYS } from '@/lib/cache';
import { ObjectId } from 'mongodb';
import fs from 'fs';
import path from 'path';
import { logAudit } from '@/lib/audit';

function hasPerm(session: any, perm: string) {
  const permissions = (session as any)?.permissions || [];
  return permissions.includes(perm);
}

function getTemplatesDir() {
  // Resolve to project root / src/templates
  return path.join(process.cwd(), 'src', 'templates');
}

async function readDefaultTemplates() {
  try {
    const dir = getTemplatesDir();
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
    return files.map((fname) => {
      const content = fs.readFileSync(path.join(dir, fname), 'utf8');
      const name = path.basename(fname, '.html');
      return { name, content, updatedAt: new Date().toISOString(), source: 'filesystem' };
    });
  } catch (e) {
    return [];
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ status: false, message: 'Unauthorized' });

  try {
    await MongoDbConnection.connect();
    const col = await MongoDbConnection.getCollection('email_templates');

    if (req.method === 'GET') {
      if (!hasPerm(session, 'templates:read')) return res.status(403).json({ status: false, message: 'Forbidden' });

      const nameParam = req.query.name ? String(Array.isArray(req.query.name) ? req.query.name[0] : req.query.name) : null;

      // Try cache for list request only
      if (!nameParam) {
        const cached = await Cache.get(CACHE_KEYS.TEMPLATES).catch(() => null);
        if (cached && Array.isArray(cached)) {
          return res.status(200).json({ status: true, items: cached });
        }
      }

      if (nameParam) {
        const doc = await col.findOne({ name: nameParam });
        if (doc) {
          await logAudit(session, 'templates:view', 'template', { name: nameParam });
          return res.status(200).json({ status: true, item: doc });
        }
        // fallback to filesystem default for single template
        const defaults = await readDefaultTemplates();
        const d = defaults.find((t) => t.name === nameParam);
        if (d) {
          await logAudit(session, 'templates:view', 'template', { name: nameParam, source: 'filesystem' });
          return res.status(200).json({ status: true, item: d });
        }
        return res.status(404).json({ status: false, message: 'Not found' });
      }

      const items = await col.find({}).sort({ name: 1 }).limit(500).toArray();
      if (!items || items.length === 0) {
        const defaults = await readDefaultTemplates();
        await Cache.set(CACHE_KEYS.TEMPLATES, defaults, 300).catch(() => {});
        await logAudit(session, 'templates:list', 'template', { count: defaults.length, source: 'filesystem' });
        return res.status(200).json({ status: true, items: defaults });
      }
      await Cache.set(CACHE_KEYS.TEMPLATES, items, 300).catch(() => {});
      await logAudit(session, 'templates:list', 'template', { count: items.length });
      return res.status(200).json({ status: true, items });
    }

    if (req.method === 'POST') {
      if (!hasPerm(session, 'templates:write')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const doc = req.body || {};
      if (!doc.name || !doc.content) return res.status(400).json({ status: false, message: 'name and content are required' });
      doc.updatedAt = new Date().toISOString();
      await col.updateOne({ name: doc.name }, { $set: doc }, { upsert: true });
      await logAudit(session, 'templates:save', 'template', { name: doc.name });
      await Cache.del(CACHE_KEYS.TEMPLATES);
      return res.status(200).json({ status: true, message: 'Saved' });
    }

    if (req.method === 'PUT') {
      if (!hasPerm(session, 'templates:write')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const { id } = req.query;
      const update = req.body || {};
      if (!id) return res.status(400).json({ status: false, message: 'id query param required' });
      const idParam = Array.isArray(id) ? id[0] : id;
      update.updatedAt = new Date().toISOString();
      await col.updateOne({ _id: new ObjectId(String(idParam)) }, { $set: update });
      await logAudit(session, 'templates:update', 'template', { resourceId: String(idParam), ...sanitizeTemplate(update) });
      await Cache.del(CACHE_KEYS.TEMPLATES);
      return res.status(200).json({ status: true, message: 'Updated' });
    }

    if (req.method === 'DELETE') {
      if (!hasPerm(session, 'templates:write')) return res.status(403).json({ status: false, message: 'Forbidden' });
      const { id } = req.query;
      if (!id) return res.status(400).json({ status: false, message: 'id query param required' });
      const idParam = Array.isArray(id) ? id[0] : id;
      await col.deleteOne({ _id: new ObjectId(String(idParam)) });
      await logAudit(session, 'templates:delete', 'template', { resourceId: String(idParam) });
      await Cache.del(CACHE_KEYS.TEMPLATES);
      return res.status(200).json({ status: true, message: 'Deleted' });
    }

    return res.status(405).json({ status: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in admin email templates:', error);
    return res.status(500).json({ status: false, message: 'Server error' });
  }
}

function sanitizeTemplate(update: any) {
  const copy: any = {};
  if (typeof update?.name === 'string') copy.name = update.name;
  return copy;
}