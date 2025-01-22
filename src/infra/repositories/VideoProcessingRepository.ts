import VideoProcessing from "../../domain/entities/VideoProcessing";
import { IVideoProcessingGateway } from "../../domain/gateways/IVideoProcessingGateway";
import IConnection from "../database/IConnection";

export default class VideoProcessingRepository implements IVideoProcessingGateway {

    constructor(private readonly connection: IConnection) { }

    async save({ bucketKey, ...videoProcessing }: VideoProcessing): Promise<void> {
        const collection = await this.connection.getCollection("video_processing");
        await collection.updateOne({ bucketKey }, { $set: { bucketKey, ...videoProcessing } }, { upsert: true });
    }
}