import https from 'https'
import { IncomingMessage } from 'http';
import { storeTmpFile } from './file';

export const validateRequestSize = async (url: string): Promise<boolean> => {
    console.log(`Validating download from URL: ${url}`);
    return new Promise((resolve, reject) => {
        https.request(url, { method: "HEAD" }, (res: IncomingMessage) => {
            const contentLengh = res.headers['content-length']
            if (!contentLengh) {
                reject(new Error("Header Content-Length must be informed"));
                return;
            }
            const fileSize = (+contentLengh / (1024 * 1024));
            if (fileSize > 50) {
                reject(new Error(`File size must be lower than 50MB. Current size is ${fileSize.toFixed(2)}MB`))
                return;
            }
            resolve(true)
        }).end();
    });
}

export const downloadFile = async (url: string, fileName: string): Promise<void> => {
    console.log(`Starting download from URL: ${url}`);
    return new Promise((resolve, reject) => {
        https.get(url, async (res: IncomingMessage) => {
            try {
                await storeTmpFile(res, fileName, `/tmp`);
                resolve()
            } catch (error) {
                const message = `Error while download on URL:${url}. Reason: ${error.message ?? JSON.stringify(error)}`
                console.log(message);
                reject(new Error(message))
            }
        });
    });
}