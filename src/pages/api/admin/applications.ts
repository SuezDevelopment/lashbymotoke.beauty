import type { NextApiRequest, NextApiResponse } from "next";
import MongoDbConnection from "@/lib/db";
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = await getServerSession(req, res, authOptions);
  if (!session) return res.status(401).json({ status: false, message: 'Unauthorized' });
  const permissions = (session as any).permissions || [];
  if (!permissions.includes('applications:read')) return res.status(403).json({ status: false, message: 'Forbidden' });

  if (req.method === 'GET') {
    try {
      await MongoDbConnection.connect();
      const col = await MongoDbConnection.getCollection('training_applications');
      const items = await col.find({}).sort({ createdAt: -1 }).limit(200).toArray();
      try {
        const { logAudit } = await import('@/lib/audit');
        await logAudit(session, 'applications:list', 'application', { count: items.length });
      } catch {}
      res.status(200).json({ status: true, items });
    } catch (error) {
      console.error('Error fetching applications:', error);
      res.status(500).json({ status: false, message: 'Server error' });
    }
  } else {
    res.status(405).json({ status: false, message: 'Method not allowed' });
  }
}