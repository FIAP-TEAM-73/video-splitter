import { CognitoIdentityProvider } from "@aws-sdk/client-cognito-identity-provider";
import MongoDBConnection from "../../infra/database/MongoDBConnection";
import VideoProcessingRepository from "../../infra/repositories/VideoProcessingRepository";
import { DispachMail } from "../../infra/smtp/DispachMail";
import S3Storage from "../../infra/storage/S3Storage";
import FFmpegVideo from "../../infra/video/FFmpegVideo";
import FindVideoProcessingUseCase from "../usecases/FindVideoProcessingUseCase";
import SplitVideoProcessingUseCase from "../usecases/SplitVideoProcessingUseCase";
import { LoginUseCase } from "../usecases/LoginUseCase";
import { IAuthGateway } from "../gateways/IAuthGateway";
import { CognitoAuth } from "../../infra/auth/CoginitoAuth";
import { SignUpUseCase } from "../usecases/SignUpUseCase";
import { UploadVideoProcessingUseCase } from "../usecases/UploadVideoProcessingUseCase";
import SQSProducer from "../../infra/producers/SQSProducer";
import { SQSClient } from "@aws-sdk/client-sqs";
import { DownloadVideoProcessingUseCase } from "../usecases/DownloadVideoProcessingUseCase";

const uri = `mongodb+srv://${process.env.DB_USER ?? 'admin'}:${process.env.DB_PASSWORD ?? 1234}@cluster0.zwrft.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

const connection = new MongoDBConnection(uri, process.env.DB_NAME ?? 'video_processing')

const videoProcessingMongoRepository = new VideoProcessingRepository(connection);

const getStorage = (bucket: string) => new S3Storage(bucket)

const videoAdapter = new FFmpegVideo();

const cognito = new CognitoIdentityProvider({})

const producer = new SQSProducer(process.env.QUEUE ?? 'download-video-queue', new SQSClient());

const getAuthGateway = (): IAuthGateway => {
    const { USER_POOL_ID: userPoolId, CLIENT_ID: clientId } = process.env;
    if (!userPoolId || !clientId) {
        throw new Error('Following envs are required to use Cognito: USER_POOL_ID and CLIENT_ID');
    }
    return new CognitoAuth(userPoolId, clientId, cognito)
}

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

export const getLoginUseCase = (): LoginUseCase => new LoginUseCase(getAuthGateway());

export const getSignUpUseCase = (): SignUpUseCase => new SignUpUseCase(getAuthGateway())

export const getUploadVideoProcessingUseCase = (): UploadVideoProcessingUseCase => {
    return new UploadVideoProcessingUseCase(videoProcessingMongoRepository, producer);
}

export const getDownloadVideoProcessingUseCase = (bucket: string): DownloadVideoProcessingUseCase => {
    return new DownloadVideoProcessingUseCase(videoProcessingMongoRepository, getStorage(bucket), mailer)
}