import { MongoClient } from "mongodb";
import IConnection from "../../../src/infra/database/IConnection";
import MongoDBConnection from "../../../src/infra/database/MongoDBConnection";

jest.mock("mongodb");

const mockMongoClient = new MongoClient('anything') as jest.Mocked<MongoClient>;
const setup = (): IConnection => new MongoDBConnection('anything', 'test_database');

describe('MongoDBConnection', () => {
    afterEach(() => {
        jest.clearAllMocks()
    });

    it('should do nothing when the database is successfully connected', async () => {
        mockMongoClient.connect.mockResolvedValue(mockMongoClient)
        const sut = setup()
        await expect(sut.connect()).resolves.toBeUndefined()
    })

    it('should do nothing when the database is successfully closed', async () => {
        mockMongoClient.close.mockResolvedValue()
        const sut = setup()
        await expect(sut.close()).resolves.toBeUndefined()
    })

});
