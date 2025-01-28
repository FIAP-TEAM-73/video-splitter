import MongoDBConnection from "../../infra/database/MongoDBConnection";
import VideoProcessingRepository from "../../infra/repositories/VideoProcessingRepository";
import { DispachMail } from "../../infra/smtp/DispachMail";
import S3Storage from "../../infra/storage/S3Storage";
import FFmpegVideo from "../../infra/video/FFmpegVideo";
import FindVideoProcessingUseCase from "../usecases/FindVideoProcessingUseCase";
import SplitVideoProcessingUseCase from "../usecases/SplitVideoProcessingUseCase";

const uri = `mongodb+srv://${process.env.DB_USER ?? 'admin'}:${process.env.DB_PASSWORD ?? 1234}@cluster0.zwrft.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

const connection = new MongoDBConnection(uri, process.env.DB_NAME ?? 'video_processing')

const videoProcessingMongoRepository = new VideoProcessingRepository(connection);

const getStorage = (bucket: string) => new S3Storage(bucket)

const videoAdapter = new FFmpegVideo();

const mailer = new DispachMail({
    host: process.env.SMTP_HOST ?? 'smtp.ethereal.email',
    port: +(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? 'abbey.marks13@ethereal.email',
    pass: process.env.SMTP_PASS ?? 'guy3WS1Mf6M1ynmW9r'
})

export const getSplitVideoProcessingUseCase = (bucket: string) => {
    return new SplitVideoProcessingUseCase(
        getStorage(bucket),
        videoProcessingMongoRepository,
        videoAdapter,
        mailer
    );
}

export const getFindVideoProcessingUseCase = () => {
    return new FindVideoProcessingUseCase(
        videoProcessingMongoRepository
    );
}