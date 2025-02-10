export default interface IEmail {
    send: (to: string, subject: string, body: string) => Promise<void>
}