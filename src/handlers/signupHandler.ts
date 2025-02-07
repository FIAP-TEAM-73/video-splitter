import { badRequest, internalServerError, noContent } from "../presenters/HttpResponses";
import { ApiEventHandler } from './handler.types';
import { getSignUpUseCase } from '../domain/factories/useCaseFactory';

export const signupHandler = async (event: ApiEventHandler<string>) => {
    try {
        if (!event.body) {
            return badRequest('Environment variable user_pool_id not set');
        }
        const { email, password } = JSON.parse(event.body);
        const useCase = getSignUpUseCase();
        await useCase.execute({ email, password });
        return noContent();
    } catch (error) {
        return internalServerError('Error while signing up an User', error);
    }
}