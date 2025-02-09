import https from 'https'
import { IncomingMessage } from 'http';
import { IVideoProcessingGateway } from '../gateways/IVideoProcessingGateway';
import { IStorage } from '../../infra/storage/IStorage';
import { readTmpFile, storeTmpFile } from '../../infra/util/file';
import IEmail from '../../infra/smtp/IEmail';
import path from 'path';
import { PutObjectCommandOutput } from '@aws-sdk/client-s3';
import { ReadStream } from 'fs';

type DownloadVideoCommand = {
    videoLink: string,
    bucketKey: string
}

export class DownloadVideoProcessingUseCase {

    constructor(
        private readonly repository: IVideoProcessingGateway,
        private readonly storage: IStorage,
        private readonly mailer: IEmail) { }

    async execute({ videoLink, bucketKey }: DownloadVideoCommand): Promise<void> {
        const video = await this.repository.findByKey(bucketKey);
        if (!video) throw new Error(`Cannot download video because there isn't any request IN_PROGRESS. Key: ${bucketKey}`)
        try {
            if (!video.isInProgress()) throw new Error(`Cannot start the download. Current status is different of IN_PROGRESS. Key: ${bucketKey}`)
            const videoIsValid = this.validateVideoSize(videoLink);
            if (!videoIsValid) return;
            const fileName = path.join('/tmp', path.basename('video.mp4'));
            await this.downloadVideo(videoLink, fileName);
            const file = await readTmpFile(fileName);
            await this.storage.put<{ Key: string, Body: Buffer }, PutObjectCommandOutput>({ Key: bucketKey, Body: file });
        } catch (error) {
            await this.repository.save(video.turnToError())
            await this.mailer.send(
                video.email.value,
                'Error processing video',
                `Error processing video: ${error.message}. Key: ${bucketKey}`,
            );
            throw new Error(`Error processing video: ${error.message}. Key: ${bucketKey}`);
        }

    }

    private validateVideoSize(url: string): Promise<boolean> {
        console.log(`Validating download from URL: ${url}`);
        return new Promise((resolve, reject) => {
            https.request(url, { method: "HEAD" }, (res: IncomingMessage) => {
                const contentLengh = res.headers['content-length']
                if (!contentLengh) {
                    reject(new Error("Header Content-Length must be informed"));
                    return;
                }
                const fileSize = (+contentLengh / (1024 * 1024));
                if (fileSize > 50) {
                    reject(new Error(`File size must be lower than 50MB. Current size is ${fileSize.toFixed(2)}MB`))
                    return;
                }
                resolve(true)
            }).end();
        });
    }

    private downloadVideo(url: string, fileName: string): Promise<void> {
        console.log(`Starting download from URL: ${url}`);
        return new Promise((resolve, reject) => {
            https.get(url, async (res: IncomingMessage) => {
                try {
                    await storeTmpFile(res, fileName, `/tmp`);
                    resolve()
                } catch (error) {
                    const message = `Error while download on URL:${url}. Reason: ${error.message ?? JSON.stringify(error)}`
                    console.log(message);
                    reject(new Error(message))
                }
            });
        });
    }
}