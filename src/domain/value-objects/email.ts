export default class Email {
    private readonly email: string;

    constructor(email: string) {
        this.email = email;
    }

    get value(): string {
        return this.email;
    }
}