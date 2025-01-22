import VideoProcessing from "../../../src/domain/entities/VideoProcessing";
import Email from "../../../src/domain/value-objects/email";
import IConnection from "../../../src/infra/database/IConnection";
import VideoProcessingRepository from "../../../src/infra/repositories/VideoProcessingRepository";

const document: VideoProcessing = {
    email: new Email('any_valid@mail.com'),
    bucketKey: 'any_bucket_key',
    interval: 10,
    status: 'IN_PROGRESS',
    zipLink: 'any_zip_link'
}

const mockCollectionMethods = {
    aggregate: (filter: any) => {
        const documentWithId = { ...document, _id: 'any_uuid' }
        console.log({ filter })
        return {
            toArray: () => Promise.resolve([documentWithId])
        }
    },
    insertOne: (doc: any) => {
        return Promise.resolve({
            "acknowledged": true,
            "insertedId": doc._id
        })
    },
    updateOne: (_doc: any) => {
        return Promise.resolve({ "acknowledged": true, "matchedCount": 1, "modifiedCount": 1 })
    }
}

describe('VideoProcessingRepository', () => {
    const mockConnection: IConnection = {
        isAlive: async () => await Promise.resolve(true),
        close: async () => { },
        connect: async () => { },
        getCollection: jest.fn(async (collection: string) => {
            console.log({ collection })
            return await Promise.resolve(mockCollectionMethods)
        })
    }
    describe('create', () => {
        it('Should save VideoProcessing when it attributes are correct', async () => {
            const sut = new VideoProcessingRepository(mockConnection);
            await sut.save(document);
            expect(mockConnection.getCollection).toHaveBeenCalledWith('video_processing');
        });
        it('Should throw an error when collection throws', async () => {
            const mockConnectionError = {
                ...mockConnection,
                getCollection: jest.fn(async (collection: string) => {
                    throw new Error('Collection error')
                })
            }
            const sut = new VideoProcessingRepository(mockConnectionError);
            await expect(sut.save(document)).rejects.toThrow(new Error('Collection error'));
        });
    });
    describe('findByKey', () => {
        it('Should return a VideoProcessing when it finds by key', async () => {
            const sut = new VideoProcessingRepository(mockConnection);
            const videoProcessing = await sut.findByKey('any_bucket_key');
            expect(mockConnection.getCollection).toHaveBeenCalledWith('video_processing');
            expect(videoProcessing).toEqual(document);
        });
        it('Should return undefined when it does not find by key', async () => {
            const mockConnectionNotFoundKey = {
                ...mockConnection,
                getCollection: jest.fn(async (collection: string) => {
                    const aggregate = jest.fn(() => ({ toArray: () => Promise.resolve([]) }))
                    return await Promise.resolve({...mockCollectionMethods, aggregate})
                })
            }
            const sut = new VideoProcessingRepository(mockConnectionNotFoundKey);
            const videoProcessing = await sut.findByKey('missing_bucket_key');
            expect(mockConnection.getCollection).toHaveBeenCalledWith('video_processing');
            expect(videoProcessing).toBeUndefined();
        });
        it('Should throw an error when collection throws', async () => {
            const mockConnectionError = {
                ...mockConnection,
                getCollection: jest.fn(async (collection: string) => {
                    throw new Error('Collection error')
                })
            }
            const sut = new VideoProcessingRepository(mockConnectionError);
            await expect(sut.findByKey('any_bucket_key')).rejects.toThrow(new Error('Collection error'));
        });
    });
});