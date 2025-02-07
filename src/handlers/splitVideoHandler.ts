import path from 'path';
import { getSplitVideoProcessingUseCase } from '../domain/factories/useCaseFactory';
import { S3EventHandler } from './handler.types';

export const splitVideoHandler = async (event: S3EventHandler): Promise<void> => {
  const [record] = event.Records;
  console.log('Received event:', JSON.stringify(record, null, 2));

  const sourceBucket = record.s3.bucket.name;
  const objectKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
  const outputFolder = `/tmp/Images`;
  const zipFilePath = `/tmp/images.zip`;
  const videoPath = path.join('/tmp', path.basename(objectKey));

  try {
    console.log('Processing video from S3:', { sourceBucket, objectKey, outputFolder, zipFilePath, videoPath });
    const useCase = getSplitVideoProcessingUseCase(sourceBucket);
    await useCase.execute({ sourceBucket, bucketKey: objectKey, outPutFolder: outputFolder, zipFilePath, filePath: videoPath });
  } catch (error) {
    console.error('Error during processing:', error);
    throw error;
  }
};
