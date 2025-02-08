import VideoProcessing from "../../../src/domain/entities/VideoProcessing";
import Email from "../../../src/domain/value-objects/email";
import IConnection from "../../../src/infra/database/IConnection";
import VideoProcessingRepository from "../../../src/infra/repositories/VideoProcessingRepository";

const document: VideoProcessing = new VideoProcessing(
    new Email('any_valid@mail.com'),
    'any_zip_link',
    'any_video_link',
    'IN_PROGRESS',
    'any_bucket_key',
    10,
    1234567890,
    1234567890
)

const anotherDocument: VideoProcessing = new VideoProcessing(
    new Email('any_valid@mail.com'),
    'any_zip_link',
    'any_video_link',
    'COMPLETED',
    'another_bucket_key',
    5,
    1234567890,
    1234567890
)

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
                    return await Promise.resolve({ ...mockCollectionMethods, aggregate })
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
    describe('find', () => {
        const mockConnectionFindMany = {
            ...mockConnection,
            getCollection: jest.fn(async (collection: string) => {
                const aggregate = jest.fn(() => ({ toArray: () => Promise.resolve([document, anotherDocument]) }))
                return await Promise.resolve({ ...mockCollectionMethods, aggregate })
            })
        }
        it('Should return a list of VideoProcessing when it finds by email', async () => {
            const params = {
                email: 'any_valid@mail.com',
                page: 1,
                size: 10
            }
            const sut = new VideoProcessingRepository(mockConnectionFindMany);
            const result = await sut.find(params);
            expect(mockConnection.getCollection).toHaveBeenCalledWith('video_processing');
            expect(result).toHaveLength(2);
            expect(result[0]).toEqual(document);
            expect(result[1]).toEqual(anotherDocument);
        });
        it('Should return an empty list when it does not find by email', async () => {
            const mockConnectionNotFoundEmail = {
                ...mockConnection,
                getCollection: jest.fn(async (collection: string) => {
                    const aggregate = jest.fn(() => ({ toArray: () => Promise.resolve([]) }))
                    return await Promise.resolve({ ...mockCollectionMethods, aggregate })
                })
            }
            const params = {
                email: 'any_valid@mail.com',
                page: 1,
                size: 10
            }
            const sut = new VideoProcessingRepository(mockConnectionNotFoundEmail);
            const result = await sut.find(params);
            expect(mockConnection.getCollection).toHaveBeenCalledWith('video_processing');
            expect(result).toHaveLength(0);
        });
        it('Should throw an error when collection throws', async () => {
            const mockConnectionError = {
                ...mockConnection,
                getCollection: jest.fn(async (collection: string) => {
                    throw new Error('Collection error')
                })
            }
            const sut = new VideoProcessingRepository(mockConnectionError);
            const params = {
                email: 'any_valid@mail.com',
                page: 1,
                size: 10
            }
            await expect(sut.find(params)).rejects.toThrow(new Error('Collection error'));
        });
    });
});