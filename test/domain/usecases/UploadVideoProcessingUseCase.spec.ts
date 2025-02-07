import VideoProcessing from "../../../src/domain/entities/VideoProcessing";
import { IProducerGateway } from "../../../src/domain/gateways/IProducerGateway";
import { IVideoProcessingGateway } from "../../../src/domain/gateways/IVideoProcessingGateway";
import { UploadVideoProcessingUseCase } from "../../../src/domain/usecases/UploadVideoProcessingUseCase";
import Email from "../../../src/domain/value-objects/email";

const mockCommand = {
    videoLink: 'any_video_link',
    email: 'any_email@mail.com',
    interval: 20,
    createdAt: Date.now()
}

const repositoryMock: jest.Mocked<IVideoProcessingGateway> = {
    findByKey: jest.fn(),
    save: jest.fn(),
    find: jest.fn()
};

const producerMock: jest.Mocked<IProducerGateway> = {
    send: jest.fn()
}

const setup = (repository: IVideoProcessingGateway, producer: IProducerGateway) => new UploadVideoProcessingUseCase(repository, producer);

describe('UploadVideoProcessingUseCase', () => {
    afterEach(() => jest.clearAllMocks());
    it('Should save VideoProcessing with success', async () => {
        const sut = setup(repositoryMock, producerMock);
        await sut.execute(mockCommand);
        expect(repositoryMock.save).toHaveBeenCalledWith({
            email: new Email(mockCommand.email),
            createdAt: expect.anything(),
            interval: mockCommand.interval,
            videoLink: mockCommand.videoLink,
            status: 'IN_PROGRESS',
            updatedAt: expect.anything(),
            bucketkey: undefined,
            zipLink: undefined
        });
    });
    it('Should dispatch VideoProcessing with success', async () => {
        const { email, videoLink, createdAt, interval } = mockCommand;
        const video = new VideoProcessing(new Email(email), undefined, videoLink, "IN_PROGRESS", undefined, interval, createdAt, createdAt)
        const sut = setup(repositoryMock, producerMock)
        await sut.execute(mockCommand)
        expect(producerMock.send).toHaveBeenCalledWith({
            id: expect.anything(),
            createdAt,
            body: JSON.stringify(video)
        });
    });
    it('Should throw an error when repository throws', async () => {
        repositoryMock.save.mockRejectedValue(new Error('Generic repository error'));
        const sut = setup(repositoryMock, producerMock);
        await expect(sut.execute(mockCommand)).rejects.toEqual(new Error('Generic repository error'))
    });
    it('Should throw an error when producer throws', async () => {
        repositoryMock.save.mockResolvedValue();
        producerMock.send.mockRejectedValue(new Error('Generic producer error'));
        const sut = setup(repositoryMock, producerMock);
        await expect(sut.execute(mockCommand)).rejects.toEqual(new Error('Generic producer error'));
    });
});