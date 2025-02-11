import { DomainError } from "../../../src/domain/base/DomainError";
import Email from "../../../src/domain/value-objects/email";

describe('Create email value object', () => {
    it('Should create email value object with a valid email', () => {
        const email = "valid@mail.com"
        const sut = new Email(email)
        expect(sut.value).toBe(email);
    });
    it('Should throw an error when creating email value object with an invalid email', () => {
        expect(() => new Email("invalid-email")).toThrow(new DomainError('Invalid email: invalid-email'));
    });
});