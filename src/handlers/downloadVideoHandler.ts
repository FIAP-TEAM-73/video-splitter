import { SQSEventHandler } from './handler.types';
import { HttpResponse, internalServerError, noContent } from '../presenters/HttpResponses';
import { getDownloadVideoProcessingUseCase } from '../domain/factories/useCaseFactory';

export const downloadVideoHandler = async (event: SQSEventHandler): Promise<HttpResponse> => {
  try {
    console.log(`Receiving event on downloadVideoHandler. Event: ${JSON.stringify(event, null, 2)}`);
    const bucketName = process.env.BUCKET_NAME;
    if (!bucketName) return internalServerError('Error to download video environment BUCKET_NAME must be provided');
    const useCase = getDownloadVideoProcessingUseCase(bucketName);
    for (const record of event.Records) {
      console.info(`downloading video for: ${record.body}`);
      const { videoLink, bucketKey } = JSON.parse(record.body);
      await useCase.execute({ videoLink, bucketKey })
    }
    return noContent()
  } catch (error) {
    const message = 'Error while downloading a video';
    console.error(message, error.message ?? JSON.stringify(error, null, 2))
    return internalServerError(message, error);
  }
};