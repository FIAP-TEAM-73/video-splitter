import path from 'path';
import { getSplitVideoProcessingUseCase } from '../domain/factories/useCaseFactory';
import { S3EventHandler } from './handler.types';
import fs from 'fs-extra';

export const splitVideoHandler = async (event: S3EventHandler): Promise<void> => {
  const [record] = event.Records;
  console.log('[splitVideoHandler] - Received event:', JSON.stringify(record, null, 2));

  const sourceBucket = record.s3.bucket.name;
  const objectKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
  const outputFolder = `/tmp/Images`;
  const zipFilePath = `/tmp/images.zip`;
  const filePath = path.join('/tmp', path.basename(objectKey));

  try {
    fs.ensureDirSync(outputFolder);
    console.log('Processing video from S3:', { sourceBucket, objectKey, outputFolder, zipFilePath, filePath });
    const useCase = getSplitVideoProcessingUseCase(sourceBucket);
    await useCase.execute({ sourceBucket, objectKey, outputFolder, zipFilePath, filePath });
  } catch (error) {
    const message = 'Error while splitting the video.';
    console.error(message, error.message ?? JSON.stringify(error, null, 2));
    throw error;
  }
};
