import { Options } from "nodemailer/lib/smtp-transport";
import IEmail from "./IEmail";
import { createTransport, Transporter } from 'nodemailer';

export type DispachMailParams = {
    host: string,
    port: number,
    user: string,
    pass: string
}

export class DispachMail implements IEmail {
    private readonly transporter: Transporter;
    constructor({ host, port, user, pass }: DispachMailParams) {
        this.transporter = createTransport({ host, port, secure: false, auth: { user, pass } } as Options);
    }
    async send(to: string, subject: string, body: string): Promise<void> {
        const mailOptions = {
            from: 'no-replay@fiap.com.br',
            to,
            subject,
            text: body
        };
        try {
            const res = await this.transporter.sendMail(mailOptions);
            console.log(`Email sent to ${to} successfully sent. Response: ${JSON.stringify(res, null, 2)}`);
        } catch (error) {
            console.error('Error sending email:', error);
        }
    }

}