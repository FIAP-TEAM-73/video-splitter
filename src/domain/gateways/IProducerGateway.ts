export type ProducerEvent<T = string> = {
    id: string
    createdAt: number
    body: T
}

export interface IProducerGateway {
    send: (event: ProducerEvent) => Promise<void>
}