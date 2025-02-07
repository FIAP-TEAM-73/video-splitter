import { CognitoIdentityProvider } from "@aws-sdk/client-cognito-identity-provider";
import { CognitoAuth } from "../../../src/infra/auth/CoginitoAuth";
import { AuthToken, Credentials, IAuthGateway } from "../../../src/domain/gateways/IAuthGateway";

jest.mock("@aws-sdk/client-cognito-identity-provider");

const userPoolId = 'testUserPoolId';
const clientId = 'testClientId';

const mockCognito = new CognitoIdentityProvider({ region: 'us-east-1' }) as jest.Mocked<CognitoIdentityProvider>;
const setup = (cognito: CognitoIdentityProvider): IAuthGateway => new CognitoAuth(userPoolId, clientId, cognito);

describe('CognitoAuth', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('signup', () => {
        it('should sign up a user successfully', async () => {
            const credentials: Credentials = { email: 'test@example.com', password: 'password123' };
            mockCognito.adminCreateUser.mockImplementation(async () => ({ User: {} }));
            mockCognito.adminSetUserPassword.mockImplementation(async () => ({}));
            const sut = setup(mockCognito);
            await sut.signup(credentials);

            expect(mockCognito.adminCreateUser).toHaveBeenCalledWith({
                UserPoolId: userPoolId,
                Username: credentials.email,
                UserAttributes: [
                    { Name: 'email', Value: credentials.email },
                    { Name: 'email_verified', Value: 'true' }
                ],
                MessageAction: 'SUPPRESS',
            });
            expect(mockCognito.adminSetUserPassword).toHaveBeenCalledWith({
                Password: credentials.password,
                UserPoolId: userPoolId,
                Username: credentials.email,
                Permanent: true
            });
        });

        it('should not set password if user creation fails', async () => {
            const credentials: Credentials = { email: 'test@example.com', password: 'password123' };
            mockCognito.adminCreateUser.mockImplementation(async () => ({}));
            const sut = setup(mockCognito);
            await sut.signup(credentials);

            expect(mockCognito.adminCreateUser).toHaveBeenCalled();
            expect(mockCognito.adminSetUserPassword).not.toHaveBeenCalled();
        });
    });

    describe('signin', () => {
        it('should sign in a user successfully', async () => {
            const credentials: Credentials = { email: 'test@example.com', password: 'password123' };
            const mockAuthToken: AuthToken = { token: 'mockIdToken' };
            mockCognito.adminInitiateAuth.mockImplementation(async () => ({
                AuthenticationResult: { IdToken: mockAuthToken.token }
            }));
            const sut = setup(mockCognito);
            const result = await sut.signin(credentials);

            expect(mockCognito.adminInitiateAuth).toHaveBeenCalledWith({
                AuthFlow: 'ADMIN_NO_SRP_AUTH',
                ClientId: clientId,
                UserPoolId: userPoolId,
                AuthParameters: {
                    USERNAME: credentials.email,
                    PASSWORD: credentials.password
                }
            });
            expect(result).toEqual(mockAuthToken);
        });

        it('should throw an error if credentials are invalid', async () => {
            const credentials: Credentials = { email: 'test@example.com', password: 'password123' };
            mockCognito.adminInitiateAuth.mockImplementation(async () => ({
                AuthenticationResult: { IdToken: undefined }
            }));
            const sut = setup(mockCognito);
            await expect(sut.signin(credentials)).rejects.toThrow('Invalid credentials');
        });
    });
});