import VideoProcessing from "../entities/VideoProcessing";
import { IVideoProcessingGateway, VideoProcessingParams } from "../gateways/IVideoProcessingGateway";

export default class FindVideoProcessingUseCase {
    constructor(private readonly videoProcessingGateway: IVideoProcessingGateway) { }

    async execute(params: VideoProcessingParams): Promise<VideoProcessing[]> {
        return await this.videoProcessingGateway.find(params);
    }
}