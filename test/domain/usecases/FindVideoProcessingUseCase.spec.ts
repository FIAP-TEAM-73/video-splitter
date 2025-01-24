import VideoProcessing from "../../../src/domain/entities/VideoProcessing";
import { IVideoProcessingGateway } from "../../../src/domain/gateways/IVideoProcessingGateway";
import FindVideoProcessingUseCase from "../../../src/domain/usecases/FindVideoProcessingUseCase";
import Email from "../../../src/domain/value-objects/email";

const document: VideoProcessing = {
    email: new Email('any_valid@mail.com'),
    bucketKey: 'any_bucket_key',
    interval: 10,
    status: 'IN_PROGRESS',
    zipLink: 'any_zip_link'
}

describe('Find VideoProcessing Use Case', () => {
    const mockVideoProcessingGateway: IVideoProcessingGateway = {
        save: jest.fn(),
        findByKey: jest.fn(),
        find: jest.fn(async ({ email, page, size }) => await Promise.resolve([document]))
    }
    it('Should find VideoProcessing when it attributes are correct', async () => {
        const sut = new FindVideoProcessingUseCase(mockVideoProcessingGateway);
        const params = { email: 'any_valid@meail.com', page: 0, size: 10 }
        const result = await sut.execute(params);
        expect(result).toEqual([document]);
    });
    it('Should return an empty array when the filter does not match', async () => {
        const mockVideoProcessingEmptyGateway: IVideoProcessingGateway = {
            ...mockVideoProcessingGateway,
            find: jest.fn(async ({ email, page, size }) => await Promise.resolve([]))
        }
        const sut = new FindVideoProcessingUseCase(mockVideoProcessingEmptyGateway);
        const params = { email: 'any_valid@meail.com', page: 0, size: 10 }
        const result = await sut.execute(params);
        expect(result).toHaveLength(0);
    });
    it('Should throw an error when finding VideoProcessing with an invalid interval', async () => {
        const mockVideoProcessingErrorGateway: IVideoProcessingGateway = {
            ...mockVideoProcessingGateway,
            find: jest.fn(async ({ email, page, size }) => await Promise.reject(new Error('Any error')))
        }
        const sut = new FindVideoProcessingUseCase(mockVideoProcessingErrorGateway);
        const params = { email: 'any_valid@meail.com', page: 0, size: 10 }
        const result = sut.execute(params);
        await expect(result).rejects.toThrow(new Error('Any error'));
    });
});