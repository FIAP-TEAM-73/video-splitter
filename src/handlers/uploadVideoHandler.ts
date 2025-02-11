import { ApiEventHandler } from './handler.types';
import { badRequest, HttpResponse, internalServerError, noContent } from '../presenters/HttpResponses';
import { getUploadVideoProcessingUseCase } from '../domain/factories/useCaseFactory';

export const uploadVideoHandler = async (event: ApiEventHandler<string>): Promise<HttpResponse> => {
    try {
        console.log(`Receiving event on uploadVideoHandler. Event: ${JSON.stringify(event, null, 2)}`);
        if (!event.body) return badRequest('Invalid request body!');
        const command = JSON.parse(event.body);
        const useCase = getUploadVideoProcessingUseCase();
        await useCase.execute(command);
        return noContent();
    } catch (error) {
        const message = 'Error while uploading a video';
        console.error(message, error.message ?? JSON.stringify(error, null, 2))
        return internalServerError(message, error);
    }
};