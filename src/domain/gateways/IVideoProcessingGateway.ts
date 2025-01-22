import VideoProcessing from "../entities/VideoProcessing";

export type VideoProcessingParams = {
    email: string
    page: number
    size: number
}
export interface IVideoProcessingGateway {
    save: (videoProcessing: VideoProcessing) => Promise<void>
    findByKey: (bucketKey: string) => Promise<VideoProcessing | undefined>
    find: (params: VideoProcessingParams) => Promise<VideoProcessing[]>
}