import { getDownloadVideoProcessingUseCase, getFindVideoProcessingUseCase, getLoginUseCase, getSignUpUseCase, getSplitVideoProcessingUseCase, getUploadVideoProcessingUseCase } from "../../../src/domain/factories/useCaseFactory"
import { DownloadVideoProcessingUseCase } from "../../../src/domain/usecases/DownloadVideoProcessingUseCase";
import FindVideoProcessingUseCase from "../../../src/domain/usecases/FindVideoProcessingUseCase";
import { LoginUseCase } from "../../../src/domain/usecases/LoginUseCase";
import { SignUpUseCase } from "../../../src/domain/usecases/SignUpUseCase";
import SplitVideoProcessingUseCase from "../../../src/domain/usecases/SplitVideoProcessingUseCase";
import { UploadVideoProcessingUseCase } from "../../../src/domain/usecases/UploadVideoProcessingUseCase";

const error = new Error('Following envs are required to use Cognito: USER_POOL_ID and CLIENT_ID');

describe('Use Case factories', () => {
    beforeEach(() => {
        process.env['USER_POOL_ID'] = 'my_user_pool_id';
        process.env['CLIENT_ID'] = 'my_client_id';
    })
    it('Should return DownloadVideoProcessingUseCase', () => {
        const useCase = getDownloadVideoProcessingUseCase('any_bucket');
        expect(useCase).toBeInstanceOf(DownloadVideoProcessingUseCase)
    });

    it('Should return FindVideoProcessingUseCase', () => {
        const useCase = getFindVideoProcessingUseCase();
        expect(useCase).toBeInstanceOf(FindVideoProcessingUseCase)
    });

    it('Should return LoginUseCase', () => {
        const useCase = getLoginUseCase();
        expect(useCase).toBeInstanceOf(LoginUseCase)
    });

    it('Should return SingUpUseCase', () => {
        const useCase = getSignUpUseCase();
        expect(useCase).toBeInstanceOf(SignUpUseCase)
    });

    it('Should throw when CLIENT_ID or USER_POOL are not set for LoginUseCase', () => {
        delete process.env['USER_POOL_ID']
        expect(() => getLoginUseCase()).toThrow(error)
    });

    it('Should throw when CLIENT_ID or USER_POOL are not set for SingUpUseCase', () => {
        delete process.env['CLIENT_ID']
        expect(() => getSignUpUseCase()).toThrow(error)
    });

    it('Should return SplitVideoProcessingUseCase', () => {
        const useCase = getSplitVideoProcessingUseCase('any_bucket');
        expect(useCase).toBeInstanceOf(SplitVideoProcessingUseCase)
    });

    it('Should return UploadVieoProcessingUseCase', () => {
        const useCase = getUploadVideoProcessingUseCase();
        expect(useCase).toBeInstanceOf(UploadVideoProcessingUseCase)
    });

    afterAll(() => {
        process.env['USER_POOL_ID'] = undefined;
        process.env['CLIENT_ID'] = undefined;
    })
})