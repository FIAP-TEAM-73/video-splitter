export type ProducerEvent<T = string> = {
    id: string
    createAt: number
    body: T
}

export interface IProducerGateway {
    send: (event: ProducerEvent) => Promise<void>
}