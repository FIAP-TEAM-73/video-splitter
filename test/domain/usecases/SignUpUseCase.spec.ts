import { IAuthGateway } from "../../../src/domain/gateways/IAuthGateway";
import { SignUpCommand, SignUpUseCase } from "../../../src/domain/usecases/SignUpUseCase";


const mockAuthGateway: jest.Mocked<IAuthGateway> = {
    signin: jest.fn(),
    signup: jest.fn()
}

const setup = (authGateway: IAuthGateway): SignUpUseCase => new SignUpUseCase(authGateway);

describe('SignUpUseCase', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should sign up a user successfully', async () => {
        const command: SignUpCommand = { email: 'test@example.com', password: 'password123' };
        mockAuthGateway.signup.mockResolvedValueOnce();
        const sut = setup(mockAuthGateway);
        await sut.execute(command);

        expect(mockAuthGateway.signup).toHaveBeenCalledWith(command);
    });

    it('should throw an error if signup fails', async () => {
        const command: SignUpCommand = { email: 'test@example.com', password: 'password123' };
        const error = new Error('Signup failed');
        mockAuthGateway.signup.mockRejectedValueOnce(error);
        const sut = setup(mockAuthGateway);
        await expect(sut.execute(command)).rejects.toThrow(error);
        expect(mockAuthGateway.signup).toHaveBeenCalledWith(command);
    });
});