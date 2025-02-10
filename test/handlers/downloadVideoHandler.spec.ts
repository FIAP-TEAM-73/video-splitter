import VideoProcessing from "../../src/domain/entities/VideoProcessing";
import { getDownloadVideoProcessingUseCase } from "../../src/domain/factories/useCaseFactory";
import Email from "../../src/domain/value-objects/email";
import { downloadVideoHandler } from "../../src/handlers";
import { SQSEventHandler } from "../../src/handlers/handler.types";
import { internalServerError, noContent } from "../../src/presenters/HttpResponses";

jest.mock('../../src/domain/factories/useCaseFactory');

const videoProcessingMock = new VideoProcessing(
    new Email('any_valid@mail.com'),
    'any_zip_link',
    'any_video_link',
    'IN_PROGRESS',
    'any_bucket_key',
    10,
    1234567890,
    1234567890
)

describe('downloadVideoHanddler', () => {
    const mockUseCase = {
        execute: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        process.env['BUCKET_NAME'] = 'any_bucket_name';
        (getDownloadVideoProcessingUseCase as jest.Mock).mockReturnValue(mockUseCase);
    });

    it('Should download video after getting the message from SQS', async () => {
        const mockEvent: SQSEventHandler = {
            Records: [
                {
                    body: JSON.stringify(videoProcessingMock)
                }
            ]
        };

        const result = await downloadVideoHandler(mockEvent);
        expect(result).toEqual(noContent());
        expect(mockUseCase.execute).toHaveBeenCalledTimes(mockEvent.Records.length)
        expect(mockUseCase.execute).toHaveBeenCalledWith({ videoLink: videoProcessingMock.videoLink, bucketKey: videoProcessingMock.bucketKey });
    });

    it('Should return internalServerError when useCase throws', async () => {
        const mockEvent: SQSEventHandler = {
            Records: [
                {
                    body: JSON.stringify(videoProcessingMock)
                }
            ]
        };

        const mockError = new Error('Processing error');
        mockUseCase.execute.mockRejectedValue(mockError);
        const result = await downloadVideoHandler(mockEvent);
        expect(result).toEqual(internalServerError('Error while downloading a video', mockError));
    });

    it('Should return internalServerError when BUCKET_NAME is not provided', async () => {
        delete process.env['BUCKET_NAME'];
        const mockEvent: SQSEventHandler = {
            Records: [
                {
                    body: JSON.stringify(videoProcessingMock)
                }
            ]
        };
        const result = await downloadVideoHandler(mockEvent);
        expect(result).toEqual(internalServerError('Error to download video environment BUCKET_NAME must be provided'));
    });
});