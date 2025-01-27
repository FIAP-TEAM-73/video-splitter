import { IStorage } from "./IStorage";
import { S3 } from '@aws-sdk/client-s3';

const s3 = new S3();

export default class S3Storage implements IStorage {

    constructor(private readonly bucket: string) { }

    async put<I, O>(input: I): Promise<O> {
        return await s3.putObject({...input, Bucket: this.bucket} as any) as any;
    }

    async get<I, O>(input: I): Promise<O> {
        return await s3.getObject({...input, Bucket: this.bucket} as any) as any;
    }
    
}