import { AuthToken, IAuthGateway } from "../../../src/domain/gateways/IAuthGateway";
import { LoginCommand, LoginUseCase } from "../../../src/domain/usecases/LoginUseCase";

const mockAuthGateway: jest.Mocked<IAuthGateway> = {
    signin: jest.fn(),
    signup: jest.fn()
}

const setup = (authGateway: IAuthGateway): LoginUseCase => new LoginUseCase(authGateway);

describe('LoginUseCase', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should login successfully and return a token', async () => {
        const command: LoginCommand = { email: 'test@example.com', password: 'password123' };
        const mockAuthToken: AuthToken = { token: 'mockIdToken' };
        mockAuthGateway.signin.mockResolvedValue(mockAuthToken);
        const sut = setup(mockAuthGateway);
        const result = await sut.execute(command);

        expect(mockAuthGateway.signin).toHaveBeenCalledWith(command);
        expect(result).toEqual(mockAuthToken);
    });

    it('should throw an error if login fails', async () => {
        const command: LoginCommand = { email: 'test@example.com', password: 'password123' };
        mockAuthGateway.signin.mockRejectedValue(new Error('Invalid credentials'));
        const sut = setup(mockAuthGateway);
        await expect(sut.execute(command)).rejects.toThrow('Invalid credentials');
        expect(mockAuthGateway.signin).toHaveBeenCalledWith(command);
    });
});