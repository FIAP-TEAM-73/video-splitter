import { getFindVideoProcessingUseCase } from '../../src/domain/factories/useCaseFactory';
import { findVideoProcessingHandler } from '../../src/handlers';
import { badRequest, internalServerError, ok } from '../../src/presenters/HttpResponses';
import { DomainError } from '../../src/domain/base/DomainError';

jest.mock('../../src/domain/factories/useCaseFactory');

const mockEvent = {
    headers: {},
    pathParameters: {},
}

describe('findVideoProcessingHandler', () => {
    const mockUseCase = {
        execute: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (getFindVideoProcessingUseCase as jest.Mock).mockReturnValue(mockUseCase);
    });

    it('should return bad request if query string parameters are missing', async () => {
        const event = { ...mockEvent, queryStringParameters: undefined };
        const response = await findVideoProcessingHandler(event);
        expect(response).toEqual(badRequest('Missing query string parameters'));
    });

    it('should return bad request if query string parameters are invalid', async () => {
        const event = { ...mockEvent, queryStringParameters: { page: 'invalid', size: 'invalid', email: '' } };
        const response = await findVideoProcessingHandler(event);
        expect(response).toEqual(badRequest(`Invalid query string parameters: ${JSON.stringify(event.queryStringParameters)}`));
    });

    it('should return ok if query string parameters are valid', async () => {
        const event = { ...mockEvent, queryStringParameters: { page: '1', size: '10', email: 'test@example.com' } };
        const mockBody = { data: 'some data' };
        mockUseCase.execute.mockResolvedValue(mockBody);
        const response = await findVideoProcessingHandler(event);
        expect(response).toEqual(ok(mockBody));
    });

    it('should return bad request if DomainError is thrown', async () => {
        const event = { ...mockEvent, queryStringParameters: { page: '1', size: '10', email: 'test@example.com' } };
        const mockError = new DomainError('Domain error');
        mockUseCase.execute.mockRejectedValue(mockError);
        const response = await findVideoProcessingHandler(event);
        expect(response).toEqual(badRequest(mockError.message, mockError));
    });

    it('should return internal server error if an unknown error is thrown', async () => {
        const event = { ...mockEvent, queryStringParameters: { page: '1', size: '10', email: 'test@example.com' } };
        const mockError = new Error('Unknown error');
        mockUseCase.execute.mockRejectedValue(mockError);
        const response = await findVideoProcessingHandler(event);
        expect(response).toEqual(internalServerError('Error during processing', mockError));
    });
});