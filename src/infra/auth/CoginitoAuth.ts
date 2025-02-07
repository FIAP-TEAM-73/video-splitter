import { AuthFlowType, CognitoIdentityProvider, MessageActionType } from "@aws-sdk/client-cognito-identity-provider";
import { AuthToken, Credentials, IAuthGateway } from "../../domain/gateways/IAuthGateway";

export class CognitoAuth implements IAuthGateway {
    constructor(
        private readonly userPoolId: string,
        private readonly clientId: string,
        private readonly cognito: CognitoIdentityProvider
    ) {
    }

    async signup({ email, password }: Credentials): Promise<void> {
        const params = {
            UserPoolId: this.userPoolId,
            Username: email,
            UserAttributes: [
                {
                    Name: 'email',
                    Value: email,
                },
                {
                    Name: 'email_verified',
                    Value: 'true',
                }
            ],
            MessageAction: MessageActionType.SUPPRESS,
        };
        const response = await this.cognito.adminCreateUser(params);
        if (!response.User) return;
        const paramsForSetPass = {
            Password: password,
            UserPoolId: this.userPoolId,
            Username: email,
            Permanent: true
        };
        await this.cognito.adminSetUserPassword(paramsForSetPass);
    }

    async signin({ email, password }: Credentials): Promise<AuthToken> {
        const params = {
            AuthFlow: AuthFlowType.ADMIN_NO_SRP_AUTH,
            ClientId: this.clientId,
            UserPoolId: this.userPoolId,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        };
        const response = await this.cognito.adminInitiateAuth(params);
        if (!response.AuthenticationResult?.IdToken) throw new Error('Invalid credentials');
        return { token: response.AuthenticationResult.IdToken }
    }
}