import { MongoClient, ServerApiVersion, Collection, Filter, ObjectId, Document } from 'mongodb';
import type { Resource } from '@/lib/types';

class MongoDbConnection {
  private client: MongoClient;
  private db: any;

  constructor() {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    this.client = new MongoClient(mongoUri);
    this.db = this.client.db(process.env.MONGO_DB_NAME || "lashbymotoke");
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      console.log('Connected to MongoDB successfully!');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.client.close();
      console.log('Disconnected from MongoDB successfully!');
    } catch (error) {
      console.error('Error disconnecting from MongoDB:', error);
      throw error;
    }
  }

  async getCollection<T = Document>(collectionName: string): Promise<Collection<T>>  {
    return this.db.collection<T>(collectionName);
  }
}

export const MongoDb = new MongoDbConnection();
export default MongoDb;

// Resource helpers
export async function getResourceCollection(): Promise<Collection<Resource>> {
  return MongoDb.getCollection<Resource>('resources');
}

export async function listResources(options: {
  query?: string;
  category?: string;
  tag?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ items: Resource[]; total: number }> {
  const col = await getResourceCollection();
  const filter: Filter<Resource> = {};
  if (options.status) filter.status = options.status as any;
  if (options.category) filter.category = options.category as any;
  if (options.tag) filter.tags = { $in: [options.tag] } as any;
  if (options.query) {
    filter.$or = [
      { title: { $regex: options.query, $options: 'i' } } as any,
      { summary: { $regex: options.query, $options: 'i' } } as any,
      { content: { $regex: options.query, $options: 'i' } } as any,
    ];
  }
  const limit = Math.min(Math.max(options.limit || 20, 1), 200);
  const offset = Math.max(options.offset || 0, 0);
  const cursor = col.find(filter).sort({ updatedAt: -1 }).skip(offset).limit(limit);
  const itemsRaw = await cursor.toArray();
  const total = await col.countDocuments(filter);
  const items: Resource[] = itemsRaw.map((it: any) => ({
    _id: it._id?.toString(),
    title: it.title,
    slug: it.slug,
    summary: it.summary,
    content: it.content,
    heroImage: it.heroImage,
    category: it.category,
    tags: it.tags || [],
    status: it.status,
    ctaLabel: it.ctaLabel,
    ctaHref: it.ctaHref,
    updatedAt: it.updatedAt,
  }));
  return { items, total };
}

export async function findResourceBySlug(slug: string, status?: string): Promise<Resource | null> {
  const col = await getResourceCollection();
  const filter: Filter<Resource> = { slug } as any;
  if (status) (filter as any).status = status;
  const it = await col.findOne(filter as any);
  if (!it) return null;
  return {
    _id: (it as any)._id?.toString(),
    title: (it as any).title,
    slug: (it as any).slug,
    summary: (it as any).summary,
    content: (it as any).content,
    heroImage: (it as any).heroImage,
    category: (it as any).category,
    tags: (it as any).tags || [],
    status: (it as any).status,
    ctaLabel: (it as any).ctaLabel,
    ctaHref: (it as any).ctaHref,
    updatedAt: (it as any).updatedAt,
  } as Resource;
}

export async function createResource(payload: Partial<Resource>): Promise<Resource> {
  const col = await getResourceCollection();
  const doc: any = {
    title: payload.title,
    slug: payload.slug,
    summary: payload.summary || '',
    content: payload.content || '',
    heroImage: payload.heroImage || '',
    category: payload.category || '',
    tags: payload.tags || [],
    status: payload.status || 'draft',
    ctaLabel: payload.ctaLabel || '',
    ctaHref: payload.ctaHref || '',
    updatedAt: payload.updatedAt || new Date().toISOString(),
  };
  const res = await col.insertOne(doc);
  return { ...doc, _id: res.insertedId.toString() } as Resource;
}

export async function updateResource(idOrSlug: string, updates: Partial<Resource>): Promise<Resource | null> {
  const col = await getResourceCollection();
  const filter: any = idOrSlug.match(/^[a-fA-F0-9]{24}$/) ? { _id: new ObjectId(idOrSlug) } : { slug: idOrSlug };
  const safeUpdates: any = { ...updates, updatedAt: new Date().toISOString() };
  await col.updateOne(filter, { $set: safeUpdates });
  const it: any = await col.findOne(filter);
  if (!it) return null;
  return {
    _id: it._id?.toString(),
    title: it.title,
    slug: it.slug,
    summary: it.summary,
    content: it.content,
    heroImage: it.heroImage,
    category: it.category,
    tags: it.tags || [],
    status: it.status,
    ctaLabel: it.ctaLabel,
    ctaHref: it.ctaHref,
    updatedAt: it.updatedAt,
  } as Resource;
}

export async function deleteResource(idOrSlug: string): Promise<boolean> {
  const col = await getResourceCollection();
  const filter: any = idOrSlug.match(/^[a-fA-F0-9]{24}$/) ? { _id: new ObjectId(idOrSlug) } : { slug: idOrSlug };
  const res = await col.deleteOne(filter);
  return res.deletedCount === 1;
}
