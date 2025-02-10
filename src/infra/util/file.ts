import fs from 'fs-extra';
import AdmZip from 'adm-zip';
import { Readable } from 'stream';

export const storeTmpFile = async (buffer: unknown, filePath: string, outputFolder: string): Promise<void> => {
    console.log('Storing file in:', { filePath, outputFolder });
    const readableStream = buffer as Readable;
    await new Promise((resolve, reject) => {
        const writeStream = fs.createWriteStream(filePath);
        readableStream.pipe(writeStream);
        readableStream.on('error', reject);
        writeStream.on('finish', resolve);
        writeStream.on('error', reject);
    });
    const stats = await fs.promises.stat(filePath);
    console.log(`File saved. File size: ${stats.size} bytes.`);
};

export const createZipFile = async (folderPath: string, zipFilePath: string): Promise<void> => {
    const zip = new AdmZip();
    zip.addLocalFolder(folderPath);
    zip.writeZip(zipFilePath);
}

export const readTmpFile = async (filePath: string): Promise<Buffer> => {
    return await fs.readFile(filePath)
}