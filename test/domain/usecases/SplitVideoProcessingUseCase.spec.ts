import SplitVideoProcessingUseCase from '../../../src/domain/usecases/SplitVideoProcessingUseCase';
import { IStorage } from '../../../src/infra/storage/IStorage';
import { IVideoProcessingGateway } from '../../../src/domain/gateways/IVideoProcessingGateway';
import { IVideo } from '../../../src/infra/video/IVideo';
import * as fileUtils from '../../../src/infra/util/file';
import VideoProcessing from '../../../src/domain/entities/VideoProcessing';
import Email from '../../../src/domain/value-objects/email';
import IEmail from '../../../src/infra/smtp/IEmail';

jest.mock('../../../src/infra/util/file');

describe('SplitVideoProcessingUseCase', () => {
    afterEach(() => {
        jest.clearAllMocks();
    })
    const storageMock: jest.Mocked<IStorage> = {
        get: jest.fn(),
        put: jest.fn()
    };
    const repositoryMock: jest.Mocked<IVideoProcessingGateway> = {
        findByKey: jest.fn(),
        save: jest.fn(),
        find: jest.fn()
    };

    const videoMock: jest.Mocked<IVideo> = {
        getDuration: jest.fn(),
        storeFrames: jest.fn()
    };

    const mailerMock: jest.Mocked<IEmail> = {
        send: jest.fn()
    }

    const setup = (): SplitVideoProcessingUseCase => new SplitVideoProcessingUseCase(
        storageMock,
        repositoryMock,
        videoMock,
        mailerMock
    );

    const mockInput = {
        outputFolder: '/tmp/output',
        zipFilePath: 'zip/path.zip',
        sourceBucket: 'bucket',
        objectKey: 'key.mp4',
        filePath: '/tmp/video.mp4',
    };

    const mockVideoProcessing: VideoProcessing = new VideoProcessing(
        new Email('valid@mail.com'),
        'zip/path.zip',
        'zip/path.zip',
        'IN_PROGRESS',
        mockInput.objectKey,
        5,
        Date.now(),
        Date.now(),
    );

    it('should process video successfully', async () => {
        const mockBody = Buffer.from('test');
        const mockDuration = 10;
        const mockInterval = 5;
        const mockFile = Buffer.from('zip');
        const key = `zip/${mockVideoProcessing.email.value}/${mockVideoProcessing.createdAt}`;
        storageMock.get.mockResolvedValue({ Body: mockBody });
        videoMock.getDuration.mockResolvedValue({ duration: mockDuration });
        repositoryMock.findByKey.mockResolvedValue(mockVideoProcessing);
        jest.spyOn(fileUtils, 'storeTmpFile').mockResolvedValue();
        jest.spyOn(fileUtils, 'createZipFile').mockResolvedValue();
        jest.spyOn(fileUtils, 'readTmpFile').mockResolvedValue(mockFile);
        const sut = setup();
        await sut.execute(mockInput);
        expect(storageMock.get).toHaveBeenCalledWith({ Key: mockInput.objectKey });
        expect(fileUtils.storeTmpFile).toHaveBeenCalledWith(mockBody, mockInput.filePath, mockInput.outputFolder);
        expect(videoMock.getDuration).toHaveBeenCalledWith(mockInput.filePath);
        expect(videoMock.storeFrames).toHaveBeenCalledTimes(2);
        expect(fileUtils.createZipFile).toHaveBeenCalledWith(mockInput.outputFolder, mockInput.zipFilePath);
        expect(storageMock.put).toHaveBeenCalledWith({ Key: key, Body: mockFile });
        expect(repositoryMock.save).toHaveBeenCalledWith(expect.objectContaining({
            status: 'COMPLETED',
            interval: mockInterval,
            zipLink: 'https://bucket.s3.us-east-1.amazonaws.com/zip/path.zip'
        }));
    });
    it('Should throw error when video processing not found', async () => {
        storageMock.get.mockResolvedValue({ Body: Buffer.from('test') });
        videoMock.getDuration.mockResolvedValue({ duration: 10 });
        repositoryMock.findByKey.mockResolvedValue(undefined);
        const sut = setup();
        await expect(sut.execute(mockInput)).rejects.toThrow('Video processing not found');
    });
    it('Should save as Error when an error occurs', async () => {
        repositoryMock.findByKey.mockResolvedValue(mockVideoProcessing);
        storageMock.get.mockRejectedValue(new Error('Error'));
        mailerMock.send.mockResolvedValue();
        const sut = setup();
        await expect(sut.execute(mockInput)).rejects.toThrow(`Error processing video: Error. Key: ${mockInput.objectKey}`);
        expect(repositoryMock.save).toHaveBeenCalledWith(expect.objectContaining({
            status: 'ERROR',
            interval: 5
        }));
    });
    it('Should send an email when an error occurs', async () => {
        repositoryMock.findByKey.mockResolvedValue(mockVideoProcessing);
        storageMock.get.mockRejectedValue(new Error('Error'));
        mailerMock.send.mockResolvedValue();
        const sut = setup();
        await expect(sut.execute(mockInput)).rejects.toThrow(`Error processing video: Error. Key: ${mockInput.objectKey}`);
        expect(mailerMock.send).toHaveBeenCalledWith(mockVideoProcessing.email.value, 'Error processing video', `Error processing video: Error. Key: ${mockInput.objectKey}`);
    });
});