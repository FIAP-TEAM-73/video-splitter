export default interface IConnection {
    connect: () => Promise<void>
    getCollection: (collection: string) => Promise<any>
    isAlive: () => Promise<boolean>
    close: () => Promise<void>
}
