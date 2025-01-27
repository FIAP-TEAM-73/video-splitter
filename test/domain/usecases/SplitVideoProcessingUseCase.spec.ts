import { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import SplitVideoProcessingUseCase from '../../../src/domain/usecases/SplitVideoProcessingUseCase';
import { IStorage } from '../../../src/infra/storage/IStorage';
import { IVideoProcessingGateway } from '../../../src/domain/gateways/IVideoProcessingGateway';
import { IVideo } from '../../../src/infra/video/IVideo';
import * as fileUtils from '../../../src/infra/util/file';
import VideoProcessing from '../../../src/domain/entities/VideoProcessing';
import Email from '../../../src/domain/value-objects/email';
import { Readable } from 'stream';
import fs from 'fs-extra';

jest.mock('../../../src/infra/util/file');

describe('SplitVideoProcessingUseCase', () => {
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

    const setup = (): SplitVideoProcessingUseCase => new SplitVideoProcessingUseCase(
        storageMock,
        repositoryMock,
        videoMock
    );

    const mockInput = {
        outPutFolder: '/tmp/output',
        zipFilePath: 'zip/path.zip',
        sourceBucket: 'bucket',
        bucketKey: 'key.mp4',
        filePath: '/tmp/video.mp4'
    };

    it('should process video successfully', async () => {
        // Arrange
        const mockBody = Buffer.from('test');
        const mockDuration = 10;
        const mockInterval = 5;
        const mockVideoProcessing: VideoProcessing = {
            interval: mockInterval,
            status: 'IN_PROGRESS',
            bucketKey: mockInput.bucketKey,
            createdAt: Date.now(),
            email: new Email('valid@mail.com'),
            updatedAt: Date.now(),
            zipLink: 'zip/path.zip'
        };

        const mockFile = Readable.from(Buffer.from('zip')) as fs.ReadStream

        storageMock.get.mockResolvedValue({ Body: mockBody });
        videoMock.getDuration.mockResolvedValue({ duration: mockDuration });
        repositoryMock.findByKey.mockResolvedValue(mockVideoProcessing);
        jest.spyOn(fileUtils, 'storeTmpFile').mockResolvedValue();
        jest.spyOn(fileUtils, 'createZipFile').mockResolvedValue();
        jest.spyOn(fileUtils, 'readTmpFile').mockResolvedValue(mockFile);

        const sut = setup();
        await sut.execute(mockInput);

        // Assert
        expect(storageMock.get).toHaveBeenCalledWith({ Key: mockInput.bucketKey });
        expect(fileUtils.storeTmpFile).toHaveBeenCalledWith(mockBody, mockInput.filePath, mockInput.outPutFolder);
        expect(videoMock.getDuration).toHaveBeenCalledWith(mockInput.bucketKey);
        expect(videoMock.storeFrames).toHaveBeenCalledTimes(2);
        expect(fileUtils.createZipFile).toHaveBeenCalledWith(mockInput.outPutFolder, mockInput.zipFilePath);
        expect(storageMock.put).toHaveBeenCalledWith({ Key: mockInput.zipFilePath, Body: mockFile });
        expect(repositoryMock.save).toHaveBeenCalledWith(expect.objectContaining({
            status: 'COMPLETED',
            interval: mockInterval
        }));
    });

    it('should throw error when video processing not found', async () => {
        // Arrange
        storageMock.get.mockResolvedValue({ Body: Buffer.from('test') });
        videoMock.getDuration.mockResolvedValue({ duration: 10 });
        repositoryMock.findByKey.mockResolvedValue(undefined);
        const sut = setup();
        // Act & Assert
        await expect(sut.execute(mockInput)).rejects.toThrow('Video processing not found');
    });
});