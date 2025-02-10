import * as fileUtils from '../../../src/infra/util/file';
import { downloadFile, validateRequestSize } from '../../../src/infra/util/http';

jest.mock('../../../src/infra/util/file');

describe.skip('http util', () => {
    afterEach(() => {
        jest.resetAllMocks();
    })
    describe('validateRequestSize', () => {
        it('Should return true when the request has contentLength', async () => {
            jest.spyOn(fileUtils, 'storeTmpFile').mockResolvedValue();
            const url = "https://download.samplelib.com/mp4/sample-5s.mp4";
            const valid = await validateRequestSize(url);
            expect(valid).toBe(true)
        })

        it('Should reject when there is no content length', async () => {
            jest.spyOn(fileUtils, 'storeTmpFile').mockResolvedValue();
            const url = "https://file-examples.com/wp-content/storage/2017/04/file_example_MP4_480_1_5MG.mp4";
            await expect(validateRequestSize(url)).rejects.toThrow(new Error("Header Content-Length must be informed"))
        })
    })

    describe('downloadFile', () => {
        it('Should store a file locally when download works', async () => {
            jest.spyOn(fileUtils, 'storeTmpFile').mockResolvedValue();
            const url = "https://download.samplelib.com/mp4/sample-5s.mp4";
            await expect(downloadFile(url, 'downloaded_file')).resolves.toBeUndefined()
        })

        it('Should reject when something went wrong', async () => {
            const error = new Error('Generic error!');
            jest.spyOn(fileUtils, 'storeTmpFile').mockRejectedValue(new Error('Generic error!'));
            const url = "https://download.samplelib.com/mp4/sample-5s.mp4";
            const message = `Error while download on URL:${url}. Reason: ${error.message ?? JSON.stringify(error)}`
            await expect(downloadFile(url, 'downloaded_file')).rejects.toThrow(new Error(message))
        })
    })
})