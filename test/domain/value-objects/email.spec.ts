import Email from "../../../src/domain/value-objects/email";

describe('Create email value object', () => {
    it('Should create email value object with a valid email', () => {
        const email = "valid@mail.com"
        const sut = new Email(email)
        expect(sut.value).toBe(email);
    });
});