import VideoProcessing from "../entities/VideoProcessing";

export interface IVideoProcessingGateway {
    save: (videoProcessing: VideoProcessing) => Promise<void>
    findByKey: (bucketKey: string) => Promise<VideoProcessing | undefined>
}