import { badRequest, HttpResponse, internalServerError, ok } from "../presenters/HttpResponses";
import { ApiEventHandler } from './handler.types';
import { getLoginUseCase } from '../domain/factories/useCaseFactory';

export const loginHandler = async (event: ApiEventHandler<string>): Promise<HttpResponse> => {
    try {
        if (!event.body) return badRequest(`Body must be valid. Body: ${event.body}`);
        const useCase = getLoginUseCase()
        const { email, password } = JSON.parse(event.body);
        const result = await useCase.execute({ email, password })
        return ok(result);
    } catch (error) {
        return internalServerError('Error while signing up an User', error);
    }
}