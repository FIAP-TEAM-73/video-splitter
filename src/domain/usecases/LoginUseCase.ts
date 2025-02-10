import { IAuthGateway } from "../gateways/IAuthGateway";

export type LoginCommand = {
    email: string;
    password: string;
}

export type LoginOutput = {
    token: string;
}

export class LoginUseCase {
    constructor(private readonly authGateway: IAuthGateway) {}

    async execute(command: LoginCommand): Promise<LoginOutput> {
        return this.authGateway.signin(command);
    }
}