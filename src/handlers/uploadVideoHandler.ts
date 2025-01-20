import { getBoundary, parse } from 'parse-multipart-data';

export const uploadVideoHandler = async (event) => {
    const { filename, data } = extractFile(event)
    console.log({ filename, data })
    return {
        statusCode: 200,
        body: JSON.stringify(
            { filename, data },
            null,
            2
        ),
    };
};

const extractFile = (event) => {
    const boundary = getBoundary(event.headers['content-type'])
    const parts = parse(Buffer.from(event.body, 'base64'), boundary);
    const [{ filename, data }] = parts

    return {
        filename,
        data
    }
}