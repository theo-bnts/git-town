import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';

export default class EmailTransporter {
  Transporter;

  static EnvironmentInstance = null;

  constructor(transporter) {
    this.Transporter = transporter;
  }

  async sendEmail(to, subject, html) {
    await this.Transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to,
      subject,
      html,
    });
  }

  async sendTemporaryCode(emailAddress, temporaryCode) {
    const template = readFileSync('resources/mails/temporary-code.html', 'utf-8');

    await this.sendEmail(
      emailAddress,
      'Ton code temporaire',
      template
        .replace('{{CODE}}', temporaryCode.Value)
        .replace('{{MINUTES}}', Number(process.env.TEMPORARY_CODE_EXPIRATION_MINUTES)),
    );
  }

  static fromEnvironment() {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      authMethod: process.env.SMTP_AUTH_METHOD,
      auth: {
        user: process.env.SMTP_USER_NAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    return new this(transporter);
  }
}
