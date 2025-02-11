import { assertEmail } from "../base/AssertionConcerns";

export default class Email {
    readonly value: string;

    constructor(email: string) {
        assertEmail(email, `Invalid email: ${email}`);
        this.value = email;
    }
}