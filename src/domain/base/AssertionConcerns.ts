import { DomainError } from "./DomainError";

export const assertEmail = (email: string, message: string) => {
    if (!email || email.trim().length === 0 || !email.includes('@') || !email.includes('.')) {
        throw new DomainError(message);
    }
}

export const assertArgumentUnionType = (value: string, types: string[], message?: string): void => {
    if (!types.includes(value)) throw new DomainError(message ?? `Value must be part of ${JSON.stringify(types)}`)
}

export const assertMinNumber = (value: number, min: number, message?: string): void => {
    if (value < min) throw new DomainError(message ?? `Value must be greater than ${min}`)
}