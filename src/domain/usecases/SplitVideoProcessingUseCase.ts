import { IStorage } from "../../infra/storage/IStorage";
import { createZipFile, readTmpFile, storeTmpFile } from "../../infra/util/file";
import { IVideo } from "../../infra/video/IVideo";
import { IVideoProcessingGateway } from "../gateways/IVideoProcessingGateway";
import { GetObjectCommandOutput } from '@aws-sdk/client-s3';
import path from 'path';

type SplitVideoProcessingCommandInput = {
    outPutFolder: string,
    zipFilePath: string,
    sourceBucket: string,
    bucketKey: string,
    filePath: string,
}

export default class SplitVideoProcessingUseCase {
    constructor(
        private readonly storage: IStorage,
        private readonly repository: IVideoProcessingGateway,
        private readonly video: IVideo
    ) { }

    async execute({ bucketKey, outPutFolder, sourceBucket, zipFilePath, filePath }: SplitVideoProcessingCommandInput): Promise<void> {
        const { Body } = await this.storage.get<{ Key: string }, GetObjectCommandOutput>({ Key: bucketKey });
        await storeTmpFile(Body, filePath, outPutFolder);
        const { duration } = await this.video.getDuration(bucketKey);
        const videoProcessing = await this.repository.findByKey(bucketKey);
        if (!videoProcessing) throw new Error('Video processing not found');
        await this.storeFrames(filePath, outPutFolder, duration, videoProcessing.interval);
        await createZipFile(outPutFolder, zipFilePath);
        const file = await readTmpFile(zipFilePath);
        await this.storage.put({ Key: zipFilePath, Body: file });
        await this.repository.save({ ...videoProcessing, status: 'COMPLETED', updatedAt: Date.now() })
    }

    private async storeFrames(filePath: string, outputFolder: string, duration: number, interval: number): Promise<void> {
        for (let currentTime = 0; currentTime < duration; currentTime += interval) {
            console.log(`Processing frame at: ${currentTime} seconds`);
            const outputFileName = `frame_at_${currentTime}.jpg`;
            const outputFilePath = path.join(outputFolder, outputFileName);
            await this.video.storeFrames({ frameTime: currentTime, outputPath: outputFilePath, path: filePath });
        }
    }
}