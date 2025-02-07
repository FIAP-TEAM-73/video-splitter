import { CognitoIdentityProvider, MessageActionType } from '@aws-sdk/client-cognito-identity-provider';
import { internalServerError, noContent } from "../presenters/HttpResponses";

const cognito = new CognitoIdentityProvider({
    region: 'us-east-1',
});

export const signupHandler = async (event: any) => {
    try {
        const { user_pool_id: userPoolId } = process.env;
        if (!userPoolId) {
            return internalServerError('Environment variable user_pool_id not set');
        }
        const { email, password } = JSON.parse(event.body);
        const params = {
            UserPoolId: userPoolId,
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
        const response = await cognito.adminCreateUser(params);
        if (response.User) {
            const paramsForSetPass = {
                Password: password,
                UserPoolId: userPoolId,
                Username: email,
                Permanent: true
            };
            await cognito.adminSetUserPassword(paramsForSetPass);
        }
        return noContent();
    } catch (error) {
        return internalServerError('Error while signing up an User', error);
    }
}