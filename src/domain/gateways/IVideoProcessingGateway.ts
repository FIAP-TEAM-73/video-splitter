import VideoProcessing from "../entities/VideoProcessing";

export interface IVideoProcessingGateway {
    save: (videoProcessing: VideoProcessing) => Promise<void>
}