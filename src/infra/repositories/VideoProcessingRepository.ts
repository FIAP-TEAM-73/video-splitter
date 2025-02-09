import VideoProcessing, { VideoProcessingStatus } from "../../domain/entities/VideoProcessing";
import { IVideoProcessingGateway, VideoProcessingParams } from "../../domain/gateways/IVideoProcessingGateway";
import Email from "../../domain/value-objects/email";
import IConnection from "../database/IConnection";

interface VideoProcessingDocument {
    _id: string;
    email: { value: string };
    bucketKey: string;
    interval: number;
    status: VideoProcessingStatus;
    zipLink: string;
    videoLink: string;
    createdAt: number;
    updatedAt: number;
}

export default class VideoProcessingRepository implements IVideoProcessingGateway {

    constructor(private readonly connection: IConnection) { }

    async save({ bucketKey, ...videoProcessing }: VideoProcessing): Promise<void> {
        const collection = await this.connection.getCollection("video_processing");
        await collection.updateOne({ bucketKey }, { $set: { bucketKey, ...videoProcessing } }, { upsert: true });
    }

    async findByKey(bucketKey: string): Promise<VideoProcessing | undefined> {
        const collection = await this.connection.getCollection("video_processing");
        const result = await collection.aggregate([{ $match: { bucketKey } }]).toArray();
        if (result.length === 0) return undefined;
        const videos = result.map(({ email, bucketKey, interval, videoLink, status, zipLink, createdAt, updatedAt }: VideoProcessingDocument) => {
            return new VideoProcessing(new Email(email.value), zipLink, videoLink, status, bucketKey, interval, createdAt, updatedAt);
        });
        return videos[0];
    }

    async find({ email, page, size }: VideoProcessingParams): Promise<VideoProcessing[]> {
        const pipeline = [
            {
                $match: { "email": { value: email } }
            },
            {
                $sort: { createdAt: -1 }
            },
            {
                $skip: page * size
            },
            {
                $limit: +size
            }
        ]
        const collection = await this.connection.getCollection("video_processing");
        const result = await collection.aggregate(pipeline).toArray();
        if (result.length === 0) return [];
        const videos = result.map(({ email, bucketKey, interval, status, videoLink, zipLink, createdAt, updatedAt }: VideoProcessingDocument) => {
            return new VideoProcessing(new Email(email.value), zipLink, videoLink, status, bucketKey, interval, createdAt, updatedAt);
        });
        return videos;
    }
}