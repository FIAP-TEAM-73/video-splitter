import { AuthFlowType, CognitoIdentityProvider } from '@aws-sdk/client-cognito-identity-provider';
import { internalServerError, ok } from "../presenters/HttpResponses";

const cognito = new CognitoIdentityProvider({
    region: 'us-east-1'
});

export const loginHandler = async (event: any) => {
    try {
        const { user_pool_id: userPoolId, client_id: clientId } = process.env;
        if (!userPoolId || !clientId) {
            return internalServerError('Environment variable user_pool_id not set');
        }
        const { email, password } = JSON.parse(event.body);
        const params = {
            AuthFlow: AuthFlowType.ADMIN_NO_SRP_AUTH,
            ClientId: clientId,
            UserPoolId: userPoolId,
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        };
        const response = await cognito.adminInitiateAuth(params);
        return ok({ token: response.AuthenticationResult?.IdToken });
    } catch (error) {
        return internalServerError('Error while signing up an User', error);
    }
}