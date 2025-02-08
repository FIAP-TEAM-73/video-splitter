import { ApiEventHandler } from './handler.types';
import { badRequest, HttpResponse, internalServerError, noContent } from '../presenters/HttpResponses';
import { getUploadVideoProcessingUseCase } from '../domain/factories/useCaseFactory';

export const uploadVideoHandler = async (event: ApiEventHandler<string>): Promise<HttpResponse> => {
  try {
    if (!event.body) return badRequest('Invalid request body!');
    const command = JSON.parse(event.body);
    const useCase = getUploadVideoProcessingUseCase();
    await useCase.execute(command);
    return noContent();
  } catch (error) {
    return internalServerError('Error while uploading a video', error);
  }  
};