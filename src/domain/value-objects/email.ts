import { assertEmail } from "../base/AssertionConcerns";

export default class Email {
    private readonly email: string;

    constructor(email: string) {
        assertEmail(email, `Invalid email: ${email}`);
        this.email = email;
    }

    get value(): string {
        return this.email;
    }
}