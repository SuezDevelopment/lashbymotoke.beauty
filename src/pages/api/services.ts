import type { NextApiRequest, NextApiResponse } from "next";
import MongoDbConnection from "@/lib/db";
import { Cache, CACHE_KEYS } from "@/lib/cache";

// Public services listing API
// Returns service categories configured via the Admin portal
// No authentication required; results are cached for faster public access
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ status: false, message: 'Method not allowed' });
  }
  try {
    await MongoDbConnection.connect();
    const col = await MongoDbConnection.getCollection('service_categories');
    const cached = Cache.get<any[]>(CACHE_KEYS.SERVICES_LIST);
    if (cached && Array.isArray(cached)) {
      return res.status(200).json({ status: true, items: cached });
    }
    const items = await col.find({}).sort({ name: 1 }).limit(500).toArray();
    Cache.set(CACHE_KEYS.SERVICES_LIST, items, 300);
    return res.status(200).json({ status: true, items });
  } catch (error) {
    console.error('Error in public services API:', error);
    return res.status(500).json({ status: false, message: 'Server error' });
  }
}