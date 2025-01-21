import { DomainError } from "./DomainError";

export const assertEmail = (email: string, message: string) => {
    if (!email || email.trim().length === 0 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new DomainError(message);
    }
}