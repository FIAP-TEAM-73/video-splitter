
export type Credentials = {
    email: string;
    password: string;
}

export type AuthToken = {
    token: string;
}

export interface IAuthGateway {
    signup: (credentials: Credentials) => Promise<void>
    signin: (credentials: Credentials) => Promise<AuthToken>
}