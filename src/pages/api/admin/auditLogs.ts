import type { NextApiRequest, NextApiResponse } from "next";
import MongoDbConnection from "@/lib/db";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ status: false, message: 'Unauthorized' });
  const permissions = (session as any).permissions || [];
  if (!permissions.includes('audit:read')) return res.status(403).json({ status: false, message: 'Forbidden' });

  if (req.method !== 'GET') return res.status(405).json({ status: false, message: 'Method not allowed' });

  const {
    action,
    actionContains,
    resource,
    resourceType,
    resourceId,
    actorEmail,
    start,
    end,
    limit,
    page,
    format,
  } = req.query as Record<string, string | string[] | undefined>;

  const lim = Math.max(1, Math.min(500, Number(limit) || 50));
  const pg = Math.max(1, Number(page) || 1);
  const skip = (pg - 1) * lim;
  const filter: any = {};
  if (typeof actorEmail === 'string' && actorEmail) filter.actorEmail = actorEmail;
  const resType = typeof resourceType === 'string' ? resourceType : (typeof resource === 'string' ? resource : undefined);
  if (resType) filter.resource = resType;
  if (typeof resourceId === 'string' && resourceId) filter.resourceId = resourceId;
  if (typeof action === 'string' && action) filter.action = action;
  if (typeof actionContains === 'string' && actionContains) filter.action = { $regex: actionContains, $options: 'i' };
  const timeRange: any = {};
  if (typeof start === 'string' && start) timeRange.$gte = start;
  if (typeof end === 'string' && end) timeRange.$lte = end;
  if (timeRange.$gte || timeRange.$lte) filter.createdAt = timeRange;

  try {
    await MongoDbConnection.connect();
    const col = await MongoDbConnection.getCollection('audit_logs');
    const cursor = col.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim);
    const items = await cursor.toArray();

    if (format === 'csv') {
      const header = ['createdAt','actorEmail','actorRole','action','resource','resourceId','message','details'].join(',');
      const rows = items.map((it: any) => {
        const detailsStr = it.details ? JSON.stringify(it.details).replace(/"/g,'""') : '';
        const messageStr = (it.message || '').toString().replace(/"/g,'""');
        return [it.createdAt, it.actorEmail, it.actorRole || '', it.action, it.resource || '', it.resourceId || '', messageStr, detailsStr]
          .map(v => `"${(v ?? '').toString()}"`).join(',');
      });
      const csv = [header, ...rows].join('\n');
      res.setHeader('Content-Type', 'text/csv');
      return res.status(200).send(csv as any);
    }

    return res.status(200).json({ status: true, items, page: pg, limit: lim });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return res.status(500).json({ status: false, message: 'Server error' });
  }
}