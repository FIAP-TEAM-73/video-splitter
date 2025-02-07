import { getSignUpUseCase } from "../../src/domain/factories/useCaseFactory";
import { signupHandler } from "../../src/handlers";
import { badRequest, internalServerError, noContent } from "../../src/presenters/HttpResponses";

jest.mock('../../src/domain/factories/useCaseFactory');

const mockEvent = {
    headers: {},
    pathParameters: {},
    queryStringParameters: {}
}

describe('signupHandler', () => {
    const mockUseCase = {
        execute: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (getSignUpUseCase as jest.Mock).mockReturnValue(mockUseCase);
    });

    it('should return bad request if body is not provided', async () => {
        const event = { ...mockEvent, body: undefined };
        const response = await signupHandler(event);
        expect(response).toEqual(badRequest('Environment variable user_pool_id not set'));
    });

    it('should return no content if signup is successful', async () => {
        const event = { ...mockEvent, body: JSON.stringify({ email: 'test@example.com', password: 'password123' }) };
        const response = await signupHandler(event);
        expect(mockUseCase.execute).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' });
        expect(response).toEqual(noContent());
    });

    it('should return internal server error if signup fails', async () => {
        const event = { ...mockEvent, body: JSON.stringify({ email: 'test@example.com', password: 'password123' }) };
        const error = new Error('Signup failed');
        mockUseCase.execute.mockRejectedValue(error);
        const response = await signupHandler(event);
        expect(response).toEqual(internalServerError('Error while signing up an User', error));
    });
});