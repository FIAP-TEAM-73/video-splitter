import VideoProcessing from "../../../src/domain/entities/VideoProcessing";
import Email from "../../../src/domain/value-objects/email";

describe('Create VideoProcessing', () => {
    it('Should create VideoProcessing when it attributes are correct', () => {
        const email = new Email('valid_email@mail.com');
        const interval = 10;
        const sut = new VideoProcessing(email, 'any_zip_link', 'any_video_link', 'IN_PROGRESS', 'any_bucket_key', interval);
        expect(sut.zipLink).toBe('any_zip_link');
        expect(sut.status).toBe('IN_PROGRESS');
        expect(sut.bucketKey).toBe('any_bucket_key');
        expect(sut.interval).toBe(interval);
        expect(sut.email).toBe(email);
    });
    it('Should throw an error when creating VideoProcessing with an invalid status', () => {
        const email = new Email('valid_email@mail.com');
        const interval = 10;
        expect(() => new VideoProcessing(email, 'any_zip_link', 'any_video_link', 'WRONG_STATUS' as any, 'any_bucket_key', interval))
            .toThrow(new Error('Invalid status: WRONG_STATUS'));
    });
    it('Should throw an error when creating VideoProcessing with an invalid interval', () => {
        const email = new Email('valid_email@mail.com');
        const interval = 0;
        expect(() => new VideoProcessing(email, 'any_zip_link', 'any_video_link', 'COMPLETED', 'any_bucket_key', interval))
            .toThrow(new Error('Value must be greater than 1'));
    });
});