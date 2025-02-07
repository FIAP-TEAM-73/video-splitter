import { SQSClient } from "@aws-sdk/client-sqs"
import { IProducerGateway, ProducerEvent } from "../../../src/domain/gateways/IProducerGateway";
import SQSProducer from "../../../src/infra/producers/SQSProducer";

jest.mock("@aws-sdk/client-sqs")

const queue = 'upload-video-queue'

const mockSqsClient = new SQSClient({ region: 'us-east-1' }) as jest.Mocked<SQSClient>;
const setup = (client: SQSClient): IProducerGateway => new SQSProducer(queue, client);

describe('SQSProducer', () => {
    afterEach(() => jest.clearAllMocks())

    describe('Send', () => {
        it('Should send an event with success', async () => {
            const event: ProducerEvent = {
                body: JSON.stringify({ email: 'any_valid@mail.com', name: 'John Doe' }),
                createdAt: Date.now(),
                id: 'any_id'
            }
            mockSqsClient.send.mockImplementation(async () => ({}))
            const sut = setup(mockSqsClient);
            await sut.send(event);
            expect(mockSqsClient.send).toHaveBeenCalledTimes(1)
        });
        it('Should throw when SQSClient throws', async () => {
            const event: ProducerEvent = {
                body: JSON.stringify({ email: 'any_valid@mail.com', name: 'John Doe' }),
                createdAt: Date.now(),
                id: 'any_id'
            }
            mockSqsClient.send.mockImplementation(async () => { throw new Error('Generic SQSClient error') })
            const sut = setup(mockSqsClient);
            await expect(sut.send(event)).rejects.toEqual(new Error('Generic SQSClient error'))
        });
    });
});