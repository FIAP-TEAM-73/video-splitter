import { getLoginUseCase } from "../../src/domain/factories/useCaseFactory";
import { loginHandler } from "../../src/handlers";
import { badRequest, internalServerError, ok } from "../../src/presenters/HttpResponses";

jest.mock('../../src/domain/factories/useCaseFactory');

const mockEvent = {
    headers: {},
    pathParameters: {},
    queryStringParameters: {}
}

describe('loginHandler', () => {
    const mockUseCase = {
        execute: jest.fn()
    };

    beforeEach(() => {
        (getLoginUseCase as jest.Mock).mockReturnValue(mockUseCase);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return bad request if body is not provided', async () => {
        const event = { ...mockEvent, body: undefined };
        const response = await loginHandler(event);
        expect(response).toEqual(badRequest(`Body must be valid. Body: ${event.body}`));
    });

    it('should return ok response if login is successful', async () => {
        const event = { ...mockEvent, body: JSON.stringify({ email: 'test@example.com', password: 'password123' }) };
        const mockResult = { token: 'mockToken' };
        mockUseCase.execute.mockResolvedValue(mockResult);

        const response = await loginHandler(event);

        expect(mockUseCase.execute).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
        expect(response).toEqual(ok(mockResult));
    });

    it('should return internal server error if an exception is thrown', async () => {
        const event = { ...mockEvent, body: JSON.stringify({ email: 'test@example.com', password: 'password123' }) };
        const mockError = new Error('Something went wrong');
        mockUseCase.execute.mockRejectedValue(mockError);

        const response = await loginHandler(event);

        expect(mockUseCase.execute).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
        expect(response).toEqual(internalServerError('Error while signing up an User', mockError));
    });
});