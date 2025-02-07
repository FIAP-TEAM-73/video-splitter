import VideoProcessing from "../entities/VideoProcessing";
import { IProducerGateway, ProducerEvent } from "../gateways/IProducerGateway";
import { IVideoProcessingGateway } from "../gateways/IVideoProcessingGateway";
import Email from "../value-objects/email";
import * as crypto  from "crypto";


type UploadVideoCommand = {
    videoLink: string
    email: string
    interval: number,
    createdAt?: number
}

export class UploadVideoProcessingUseCase {
    constructor(private readonly repository: IVideoProcessingGateway, private readonly producer: IProducerGateway) { }

    async execute({ videoLink, email, interval, createdAt }: UploadVideoCommand): Promise<void> {
        const videoProcessing = new VideoProcessing(new Email(email), undefined, videoLink, "IN_PROGRESS", undefined, interval, createdAt, createdAt)
        await this.repository.save(videoProcessing);
        const event: ProducerEvent = {
            id: crypto.randomUUID(),
            createdAt: createdAt ?? Date.now(),
            body: JSON.stringify(videoProcessing)
        }
        await this.producer.send(event);
    }
}