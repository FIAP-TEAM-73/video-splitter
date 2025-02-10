import { getUploadVideoProcessingUseCase } from "../../src/domain/factories/useCaseFactory";
import { uploadVideoHandler } from "../../src/handlers";
import { internalServerError, noContent } from "../../src/presenters/HttpResponses";

jest.mock('../../src/domain/factories/useCaseFactory');

const mockEvent = {
    headers: {},
    pathParameters: {},
    queryStringParameters: {}
}

const body = {
    videoLink: 'any_video_link',
    email: 'any_email@mail.com',
    interval: 20,
    createdAt: Date.now()
}

describe('uploadVideoProcessingHandler', () => {
    const mockUseCase = {
        execute: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        process.env['BUCKET_NAME'] = 'any_bucket_name';
        (getUploadVideoProcessingUseCase as jest.Mock).mockReturnValue(mockUseCase);
    });

    it('Should download video after getting the message from SQS', async () => {
        const event = {...mockEvent, body: JSON.stringify(body)}
        const result = await uploadVideoHandler(event);
        expect(result).toEqual(noContent());
        expect(mockUseCase.execute).toHaveBeenCalledTimes(1)
        expect(mockUseCase.execute).toHaveBeenCalledWith(body);
    });

    it('Should return internalServerError when useCase throws', async () => {
        const event = {...mockEvent, body: JSON.stringify(body)}
        const mockError = new Error('Processing error');
        mockUseCase.execute.mockRejectedValue(mockError);
        const result = await uploadVideoHandler(event);
        expect(result).toEqual(internalServerError('Error while uploading a video', mockError));
    });

});