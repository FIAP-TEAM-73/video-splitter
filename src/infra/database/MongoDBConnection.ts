import IConnection from "./IConnection";
import { MongoClient } from "mongodb";

export default class MongoDBConnection implements IConnection {

    private readonly client: MongoClient;

    constructor(uri: string, private readonly database: string) {
        this.client = new MongoClient(uri);
    }

    async connect(): Promise<void> {
        await this.client.connect()
        console.log('Successfully connected to database', this.database)
    }

    async getCollection(collection: string): Promise<any> {
        return this.client.db(this.database).collection(collection)
    }

    async isAlive(): Promise<boolean> {
        try {
            await this.client.db(this.database).command({ ping: 1 });
            return true;
        } catch (error) {
            console.log(`Error while validating DB connection ${this.database}. Error: ${JSON.stringify(error)}`)
        }
        return false;
    }

    async close(): Promise<void> {
        console.log('Closing database connection', this.database)
        await this.client.close()
    }

}