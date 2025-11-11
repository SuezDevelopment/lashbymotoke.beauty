import { MongoClient, ServerApiVersion, Collection } from 'mongodb';

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

  async getCollection(collectionName: string): Promise<Collection>  {
    return this.db.collection(collectionName);
  }
}

export default new MongoDbConnection();
