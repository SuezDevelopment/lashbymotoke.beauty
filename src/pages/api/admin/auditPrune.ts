import type { NextApiRequest, NextApiResponse } from 'next';
import MongoDbConnection from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import { logAudit } from '@/lib/audit';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ status: false, message: 'Unauthorized' });
  const role = (session as any).role;
  // Restrict pruning to admin role explicitly
  if (role !== 'admin') return res.status(403).json({ status: false, message: 'Forbidden' });

  if (req.method !== 'POST') return res.status(405).json({ status: false, message: 'Method not allowed' });

  const { days, before } = req.body || {};
  let cutoffISO: string | null = null;
  if (typeof before === 'string' && before) {
    cutoffISO = new Date(before).toISOString();
  } else if (typeof days === 'number' && days > 0) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    cutoffISO = d.toISOString();
  } else {
    return res.status(400).json({ status: false, message: 'Provide either numeric days > 0 or an ISO date in "before"' });
  }

  try {
    await MongoDbConnection.connect();
    const col = await MongoDbConnection.getCollection('audit_logs');
    const result = await col.deleteMany({ createdAt: { $lt: cutoffISO } });
    await logAudit(session, 'audit:prune', 'audit_logs', { message: `Pruned logs before ${cutoffISO}`, deletedCount: result.deletedCount });
    return res.status(200).json({ status: true, deletedCount: result.deletedCount, cutoff: cutoffISO });
  } catch (error) {
    console.error('Error pruning audit logs:', error);
    return res.status(500).json({ status: false, message: 'Server error' });
  }
}