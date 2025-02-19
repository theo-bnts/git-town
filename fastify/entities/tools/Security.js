import crypto from 'crypto';

export default class Security {
  static generateRandomIntegerFigure() {
    return Math.floor(crypto.randomBytes(1)[0] / 25.5);
  }

  static generateTemporaryCodeValue() {
    return Array(Number(process.env.TEMPORARY_CODE_LENGTH))
      .fill(0)
      .map(() => this.generateRandomIntegerFigure())
      .join('');
  }

  static generateTokenValue() {
    return crypto.randomBytes(process.env.TOKEN_LENGTH / 2).toString('hex');
  }

  static generateHashSaltValue() {
    return crypto.randomBytes(process.env.USER_PASSWORD_HASH_SALT_LENGTH / 2).toString('hex');
  }

  static hashPassword(password, salt) {
    return crypto
      .createHash('sha512')
      .update(password)
      .update(crypto.createHash('sha512').update(salt).digest('hex'))
      .digest('hex');
  }

  static hashGitHubWebhookSecret(body) {
    return crypto
      .createHmac('sha256', process.env.GITHUB_WEBHOOK_SECRET)
      .update(body)
      .digest('hex');
  }
}
