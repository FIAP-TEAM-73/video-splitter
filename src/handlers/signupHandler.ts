import { badRequest, internalServerError, noContent } from "../presenters/HttpResponses";
import { ApiEventHandler } from './handler.types';
import { getSignUpUseCase } from '../domain/factories/useCaseFactory';

export const signupHandler = async (event: ApiEventHandler<string>) => {
    try {
        console.log(`Receiving event on signupHandler.`);
        if (!event.body) {
            return badRequest('Error to Sign Up user. Body must be informed.');
        }
        const { email, password } = JSON.parse(event.body);
        const useCase = getSignUpUseCase();
        await useCase.execute({ email, password });
        return noContent();
    } catch (error) {
        const message = 'Error to Sign Up user';
        console.error(message, error.message ?? JSON.stringify(error, null, 2));
        return internalServerError('Error to Sign Up user', error);
    }
}