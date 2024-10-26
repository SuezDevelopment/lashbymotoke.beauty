import { MongoClient, ServerApiVersion, Collection } from 'mongodb';

class MongoDbConnection {
  private client: MongoClient;
  private db: any;

  constructor() {
    this.client = new MongoClient('mongodb+srv://astrodev:79597959@cluster0.8ylkhdm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    this.db = this.client.db("eunicemakeover");
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
