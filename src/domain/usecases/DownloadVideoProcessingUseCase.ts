import { IVideoProcessingGateway } from '../gateways/IVideoProcessingGateway';
import { IStorage } from '../../infra/storage/IStorage';
import { readTmpFile } from '../../infra/util/file';
import { downloadFile, validateRequestSize } from '../../infra/util/http';
import IEmail from '../../infra/smtp/IEmail';
import path from 'path';
import { PutObjectCommandOutput } from '@aws-sdk/client-s3';

type DownloadVideoCommand = {
    videoLink: string,
    bucketKey: string
    changeTime?: number
}

export class DownloadVideoProcessingUseCase {

    constructor(
        private readonly repository: IVideoProcessingGateway,
        private readonly storage: IStorage,
        private readonly mailer: IEmail) { }

    async execute({ videoLink, bucketKey, changeTime = Date.now() }: DownloadVideoCommand): Promise<void> {
        const video = await this.repository.findByKey(bucketKey);
        if (!video) throw new Error(`Cannot download video because there isn't any request IN_PROGRESS. Key: ${bucketKey}`)
        try {
            if (!video.isInProgress()) throw new Error(`Cannot start the download. Current status is different of IN_PROGRESS. Key: ${bucketKey}`)
            const videoIsValid = await validateRequestSize(videoLink);
            if (!videoIsValid) return;
            const fileName = path.join('/tmp', path.basename('video.mp4'));
            await downloadFile(videoLink, fileName);
            const file = await readTmpFile(fileName);
            await this.storage.put<{ Key: string, Body: Buffer }, PutObjectCommandOutput>({ Key: bucketKey, Body: file });
        } catch (error) {
            if (video.isInProgress()) {
                await this.repository.save(video.turnToError(changeTime))
            }
            await this.mailer.send(
                video.email.value,
                'Error processing video',
                `Error processing video: ${error.message}. Key: ${bucketKey}`,
            );
            throw new Error(`Error processing video: ${error.message}. Key: ${bucketKey}`);
        }

    }
}