import { IVideo, StoreFramesParams } from "./IVideo";
import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

export default class FFmpegVideo implements IVideo {

    async getDuration(videoPath: string): Promise<{ duration: number }> {
        console.log(`Getting durantion from ${videoPath}`);
        return new Promise((resolve, reject) => {
            ffmpeg(videoPath).ffprobe((err, metadata) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({ duration: metadata.format.duration ?? 0 });
                }
            });
        });
    }

    async storeFrames({ path: videoPath, frameTime, outputPath }: StoreFramesParams): Promise<void> {
        console.log(`captureFrame with videoPath ${videoPath}, outputPath ${outputPath}, frameTime ${frameTime}`);
        await new Promise((resolve, reject) => {
            ffmpeg(videoPath)
                .screenshots({
                    timestamps: [frameTime],
                    filename: path.basename(outputPath),
                    folder: path.dirname(outputPath),
                    size: '1920x1080',
                })
                .on('end', () => resolve(true))
                .on('error', (err) => reject(err));
        });
    }
}