export interface IStorage {
    put<I, O>(input: I): Promise<O>;
    get<I, O>(input: I): Promise<O>;
}