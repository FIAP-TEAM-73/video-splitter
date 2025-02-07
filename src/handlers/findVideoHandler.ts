import { APIGatewayProxyResult } from 'aws-lambda';
import { badRequest, internalServerError, ok } from '../presenters/HttpResponses';
import { getFindVideoProcessingUseCase } from '../domain/factories/useCaseFactory';
import { DomainError } from '../domain/base/DomainError';
import { ApiEventHandler } from './handler.types';

export const findVideoProcessingHandler = async (event: ApiEventHandler): Promise<APIGatewayProxyResult> => {
    try {
        if (!event.queryStringParameters) {
            return badRequest('Missing query string parameters');
        }
        if (validateParams(event.queryStringParameters)) {
            const { page, size, email } = event.queryStringParameters;
            const useCase = getFindVideoProcessingUseCase();
            //TODO wrap body in a pageable object
            const body = await useCase.execute({ page, size, email });
            return ok(body);
        }
        return badRequest(`Invalid query string parameters: ${JSON.stringify(event.queryStringParameters)}`);
    } catch (error) {
        console.error(`Error during processing: ${error?.message ?? JSON.stringify(error)}`);
        if (error instanceof DomainError) {
            return badRequest(error.message, error);
        }
        return internalServerError('Error during processing', error);
    }

};

const validateParams = (value: unknown): value is { page: number, size: number, email: string } => {
    if (value === null || typeof value !== 'object') return false;
    if (
        !('page' in value) ||
        !('size' in value) ||
        !('email' in value)) {
        return false
    };
    const { page, size, email } = value;
    if (!page || (typeof page === 'string' && isNaN(+page))) return false;
    if (!size || (typeof size === 'string' && isNaN(+size))) return false;
    if (!email) return false;
    return true
}