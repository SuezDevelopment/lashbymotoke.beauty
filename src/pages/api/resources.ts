import type { NextApiRequest, NextApiResponse } from "next";
import MongoDbConnection from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ status: false, message: 'Method not allowed' });
  const { q, category, tag, page, limit } = req.query as Record<string, string | undefined>;
  try {
    await MongoDbConnection.connect();
    const col = await MongoDbConnection.getCollection('resources');
    const filter: any = { status: 'published' };
    if (typeof category === 'string' && category) filter.category = category;
    if (typeof tag === 'string' && tag) filter.tags = { $in: [tag] };
    if (typeof q === 'string' && q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { summary: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
      ];
    }
    const lim = Math.max(1, Math.min(50, Number(limit) || 20));
    const pg = Math.max(1, Number(page) || 1);
    const skip = (pg - 1) * lim;
    const items = await col.find(filter).sort({ createdAt: -1 }).skip(skip).limit(lim).toArray();
    return res.status(200).json({ status: true, items, page: pg, limit: lim });
  } catch (error) {
    console.error('Error fetching resources:', error);
    return res.status(500).json({ status: false, message: 'Server error' });
  }
}