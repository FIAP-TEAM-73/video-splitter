import { badRequest, internalServerError, noContent } from "../presenters/HttpResponses";
import { ApiEventHandler } from './handler.types';
import { getSignUpUseCase } from '../domain/factories/useCaseFactory';

export const signupHandler = async (event: ApiEventHandler<string>) => {
    try {
        if (!event.body) {
            return badRequest('Error to Sign Up user. Body must be informed.');
        }
        const { email, password } = JSON.parse(event.body);
        const useCase = getSignUpUseCase();
        await useCase.execute({ email, password });
        return noContent();
    } catch (error) {
        return internalServerError('Error to Sign Up user', error);
    }
}