import { badRequest, HttpResponse, internalServerError, ok } from "../presenters/HttpResponses";
import { ApiEventHandler } from './handler.types';
import { getLoginUseCase } from '../domain/factories/useCaseFactory';

export const loginHandler = async (event: ApiEventHandler<string>): Promise<HttpResponse> => {
    try {
        console.log(`Receiving event on signupHandler.`);
        if (!event.body) return badRequest(`Body must be valid. Body: ${event.body}`);
        const useCase = getLoginUseCase()
        const { email, password } = JSON.parse(event.body);
        const result = await useCase.execute({ email, password })
        return ok(result);
    } catch (error) {
        const message = 'Error to login user';
        console.error(message, error.message ?? JSON.stringify(error, null, 2));
        return internalServerError(message, error);
    }
}