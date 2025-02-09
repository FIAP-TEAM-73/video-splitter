import { ReadStream } from "fs";
import IEmail from "../../infra/smtp/IEmail";
import { IStorage } from "../../infra/storage/IStorage";
import { createZipFile, readTmpFile, storeTmpFile } from "../../infra/util/file";
import { IVideo } from "../../infra/video/IVideo";
import { IVideoProcessingGateway } from "../gateways/IVideoProcessingGateway";
import { GetObjectCommandOutput, PutObjectCommandOutput } from '@aws-sdk/client-s3';
import path from 'path';

type SplitVideoProcessingCommandInput = {
    outputFolder: string,
    zipFilePath: string,
    objectKey: string,
    filePath: string,
    sourceBucket: string
}

export default class SplitVideoProcessingUseCase {
    constructor(
        private readonly storage: IStorage,
        private readonly repository: IVideoProcessingGateway,
        private readonly video: IVideo,
        private readonly mailer: IEmail
    ) { }

    async execute({ sourceBucket, objectKey, outputFolder, zipFilePath, filePath }: SplitVideoProcessingCommandInput): Promise<void> {
        const videoProcessing = await this.repository.findByKey(objectKey);
        if (!videoProcessing) throw new Error('Video processing not found');
        try {
            const { Body } = await this.storage.get<{ Key: string }, GetObjectCommandOutput>({ Key: objectKey });
            await storeTmpFile(Body, filePath, outputFolder);
            const { duration } = await this.video.getDuration(filePath);
            console.log(`Video duration is ${duration}s`);
            await this.storeFrames(filePath, outputFolder, duration, videoProcessing.interval);
            await createZipFile(outputFolder, zipFilePath);
            const file = await readTmpFile(zipFilePath);
            await this.storage.put<{ Key: string, Body: Buffer }, PutObjectCommandOutput>({ Key: zipFilePath, Body: file });
            const zipLink = this.getZipLink(sourceBucket, zipFilePath);
            await this.repository.save(videoProcessing.turnToCompleted(zipLink))
        } catch (error) {
            await this.repository.save(videoProcessing.turnToError())
            await this.mailer.send(
                videoProcessing.email.value,
                'Error processing video',
                `Error processing video: ${error.message}. Key: ${objectKey}`,
            );
            throw new Error(`Error processing video: ${error.message}. Key: ${objectKey}`);
        }
    }

    private async storeFrames(filePath: string, outputFolder: string, duration: number, interval: number): Promise<void> {
        for (let currentTime = 0; currentTime < duration; currentTime += interval) {
            console.log(`Processing frame at: ${currentTime} seconds`);
            const outputFileName = `frame_at_${currentTime}.jpg`;
            const outputFilePath = path.join(outputFolder, outputFileName);
            await this.video.storeFrames({ frameTime: currentTime, outputPath: outputFilePath, path: filePath });
        }
    }

    private getZipLink(bucket: string, key: string): string {
        return `https://${bucket}.s3.us-east-1.amazonaws.com/${key}`;
    }
}