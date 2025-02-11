import { IAuthGateway } from "../gateways/IAuthGateway";

export type SignUpCommand = {
    email: string;
    password: string;
}

export class SignUpUseCase {
    constructor(private readonly authGateway: IAuthGateway) { }
    
    async execute(command: SignUpCommand): Promise<void> {
        return this.authGateway.signup(command);
    }
}   