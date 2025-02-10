import { IStorage } from '../../../src/infra/storage/IStorage';
import { IVideoProcessingGateway } from '../../../src/domain/gateways/IVideoProcessingGateway';
import VideoProcessing from '../../../src/domain/entities/VideoProcessing';
import Email from '../../../src/domain/value-objects/email';
import IEmail from '../../../src/infra/smtp/IEmail';
import { DownloadVideoProcessingUseCase } from '../../../src/domain/usecases/DownloadVideoProcessingUseCase';
import * as fileUtils from '../../../src/infra/util/file';
import * as httpUtils from '../../../src/infra/util/http';

jest.mock('../../../src/infra/util/file');
jest.mock('../../../src/infra/util/http');

describe('DownloadVideoProcessingUseCase', () => {
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

    const mailerMock: jest.Mocked<IEmail> = {
        send: jest.fn()
    }

    const setup = (): DownloadVideoProcessingUseCase => new DownloadVideoProcessingUseCase(
        repositoryMock,
        storageMock,
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
        'https://anylink.com/video.mp4',
        'IN_PROGRESS',
        mockInput.objectKey,
        5,
        Date.now(),
        Date.now(),
    );

    it('should download video successfully', async () => {
        const mockFile = Buffer.from('zip');
        repositoryMock.findByKey.mockResolvedValue(mockVideoProcessing);
        jest.spyOn(fileUtils, 'readTmpFile').mockResolvedValue(mockFile);
        jest.spyOn(httpUtils, 'validateRequestSize').mockResolvedValue(true);
        jest.spyOn(httpUtils, 'downloadFile').mockResolvedValue();
        const fileName = '/tmp/video.mp4';
        const { videoLink, bucketKey = mockInput.objectKey } = mockVideoProcessing;
        const sut = setup();
        await sut.execute({ videoLink, bucketKey });
        expect(httpUtils.downloadFile).toHaveBeenCalledWith(videoLink, fileName);
        expect(httpUtils.validateRequestSize).toHaveBeenCalledWith(videoLink);
        expect(fileUtils.readTmpFile).toHaveBeenCalledWith(fileName);
        expect(storageMock.put).toHaveBeenCalledWith({ Key: mockInput.objectKey, Body: mockFile });
    });
    it('Should throw error when video processing not found', async () => {
        const error = new Error(`Cannot download video because there isn't any request IN_PROGRESS. Key: ${mockInput.objectKey}`);
        repositoryMock.findByKey.mockResolvedValue(undefined);
        const { videoLink, bucketKey = mockInput.objectKey } = mockVideoProcessing;
        const sut = setup();
        await expect(sut.execute({ videoLink, bucketKey })).rejects.toThrow(error);
    });
    it('Should throw error when video processing not found', async () => {
        const message = `Cannot start the download. Current status is different of IN_PROGRESS. Key: ${mockInput.objectKey}`
        const error = new Error(`Error processing video: ${message}. Key: ${mockInput.objectKey}`);
        repositoryMock.findByKey.mockResolvedValue(mockVideoProcessing.turnToError());
        const { videoLink, bucketKey = mockInput.objectKey } = mockVideoProcessing;
        const changeTime = Date.now();
        const sut = setup();
        await expect(sut.execute({ videoLink, bucketKey, changeTime })).rejects.toThrow(error);
        expect(repositoryMock.save).not.toHaveBeenCalled();
        expect(mailerMock.send).toHaveBeenCalledWith(
            mockVideoProcessing.email.value,
            'Error processing video',
            `Error processing video: ${message}. Key: ${mockInput.objectKey}`
        )
    });
    it('Should throw error when request size is invalid', async () => {
        repositoryMock.findByKey.mockResolvedValue(mockVideoProcessing);
        jest.spyOn(httpUtils, 'validateRequestSize').mockResolvedValue(false);
        const { videoLink, bucketKey = mockInput.objectKey } = mockVideoProcessing;
        const sut = setup();
        await expect(sut.execute({ videoLink, bucketKey })).resolves.toBeUndefined();
        expect(httpUtils.validateRequestSize).toHaveBeenCalledWith(videoLink);
        
    });
    it('Should throw error when storage throws', async () => {
        const mockFile = Buffer.from('zip');
        const message = 'Generic Error!';
        const error = new Error(`Error processing video: ${message}. Key: ${mockInput.objectKey}`);
        repositoryMock.findByKey.mockResolvedValue(mockVideoProcessing);
        storageMock.put.mockRejectedValue(new Error(message))
        jest.spyOn(fileUtils, 'readTmpFile').mockResolvedValue(mockFile);
        jest.spyOn(httpUtils, 'validateRequestSize').mockResolvedValue(true);
        jest.spyOn(httpUtils, 'downloadFile').mockResolvedValue();
        const { videoLink, bucketKey = mockInput.objectKey } = mockVideoProcessing;
        const changeTime = Date.now();
        const sut = setup();
        await expect(sut.execute({ videoLink, bucketKey, changeTime })).rejects.toThrow(error);
        expect(repositoryMock.save).toHaveBeenCalledWith(mockVideoProcessing.turnToError(changeTime))
        expect(mailerMock.send).toHaveBeenCalledWith(
            mockVideoProcessing.email.value,
            'Error processing video',
            `Error processing video: ${message}. Key: ${mockInput.objectKey}`
        )
    });
});