import * as AWS from "aws-sdk"
import { internalServerError, noContent } from "../presenters/HttpResponses";

const cognito = new AWS.CognitoIdentityServiceProvider({ region: 'us-east-1' });

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
            MessageAction: 'SUPPRESS',
        };
        const response = await cognito.adminCreateUser(params).promise();
        if (response.User) {
            const paramsForSetPass = {
                Password: password,
                UserPoolId: userPoolId,
                Username: email,
                Permanent: true
            };
            await cognito.adminSetUserPassword(paramsForSetPass).promise();
        }
        return noContent();
    } catch (error) {
        return internalServerError('Error while signing up an User', error);
    }
}