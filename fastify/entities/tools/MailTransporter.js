import nodemailer from 'nodemailer';

class MailTransporter {
  Transporter;

  static Instance = null;

  constructor() {
    this.Transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: /true/i.test(process.env.SMTP_SECURE),
      authMethod: process.env.SMTP_AUTH_METHOD,
      auth: {
        user: process.env.SMTP_USER_NAME,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendEmail(to, subject, html) {
    await this.Transporter.sendMail({
      from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      to,
      subject,
      html,
    });
  }

  async sendTemporaryCode(emailAddress, temporaryCode) {
    await this.sendEmail(
      emailAddress,
      'Code temporaire',
      process.env.MAIL_BODY.replace(
        '%CONTENT%',
        `Votre code temporaire est <b>${temporaryCode.Value}</b>.<br>Il expirera dans ${process.env.TEMPORARY_CODE_EXPIRATION_SECONDS / 60} minutes.`,
      ),
    );
  }
}

export default MailTransporter;
