import { IProducerGateway, ProducerEvent } from "../../domain/gateways/IProducerGateway";
import { SQSClient, SendMessageCommand, SendMessageCommandOutput } from "@aws-sdk/client-sqs";

export default class SQSProducer implements IProducerGateway {
    constructor(private readonly queue: string, private readonly client: SQSClient) { }
    async send(event: ProducerEvent): Promise<void> {
        const params = {
            QueueUrl: this.queue,
            MessageBody: event.body,
        }
        await this.client.send(new SendMessageCommand(params))
    }
}