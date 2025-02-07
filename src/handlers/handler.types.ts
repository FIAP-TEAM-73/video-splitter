export type ApiEventHandler<T = undefined> = {
    body?: T;
    headers: Record<string, string>;
    pathParameters: Record<string, string> | undefined;
    queryStringParameters: Record<string, string> | undefined;
}

export type S3EventHandler = {
    Records: {
        s3: {
            bucket: {
                name: string;
            };
            object: {
                key: string;
            };
        }
    }[];
}