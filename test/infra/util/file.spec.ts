import fs from 'fs-extra';
import { readTmpFile } from '../../../src/infra/util/file';


describe('File Utility Functions', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('readTmpFile should read a file and return its contents', async () => {
        const mockFilePath = '/tmp/test.txt';
        const mockBuffer = Buffer.from('file content');

        jest.spyOn(fs, 'readFile').mockImplementation(async () => mockBuffer);

        const result = await readTmpFile(mockFilePath);

        expect(fs.readFile).toHaveBeenCalledWith(mockFilePath);
        expect(result).toBe(mockBuffer);
    });
});
