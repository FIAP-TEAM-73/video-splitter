import { getSplitVideoProcessingUseCase } from "../../src/domain/factories/useCaseFactory";
import { splitVideoHandler } from "../../src/handlers";

jest.mock('../../src/domain/factories/useCaseFactory');

describe('splitVideoHandler', () => {
    const mockUseCase = {
        execute: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (getSplitVideoProcessingUseCase as jest.Mock).mockReturnValue(mockUseCase);
    });

    it('should process video from S3 event', async () => {
        const mockEvent = {
            Records: [
                {
                    s3: {
                        bucket: { name: 'source-bucket' },
                        object: { key: 'video.mp4' }
                    }
                }
            ]
        };

        await splitVideoHandler(mockEvent);

        expect(getSplitVideoProcessingUseCase).toHaveBeenCalledWith('source-bucket');
        expect(mockUseCase.execute).toHaveBeenCalledWith({
            sourceBucket: 'source-bucket',
            objectKey: 'video.mp4',
            outputFolder: '/tmp/Images',
            zipFilePath: '/tmp/images.zip',
            filePath: '/tmp/video.mp4'
        });
    });

    it('should log and throw error if processing fails', async () => {
        const mockEvent = {
            Records: [
                {
                    s3: {
                        bucket: { name: 'source-bucket' },
                        object: { key: 'video.mp4' }
                    }
                }
            ]
        };

        const mockError = new Error('Processing error');
        mockUseCase.execute.mockRejectedValue(mockError);

        await expect(splitVideoHandler(mockEvent)).rejects.toThrow('Processing error');
    });
});