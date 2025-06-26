import crypto from 'crypto';

export default class Security {
  static generateTemporaryCodeValue() {
    return Array(Number(process.env.TEMPORARY_CODE_LENGTH))
      .fill(0)
      .map(() => crypto.randomInt(0, 10))
      .join('');
  }

  static generateTokenValue() {
    return crypto.randomBytes(Number(process.env.TOKEN_LENGTH) / 2).toString('hex');
  }

  static generateHashSaltValue() {
    return crypto.randomBytes(Number(process.env.USER_PASSWORD_HASH_SALT_LENGTH) / 2).toString('hex');
  }

  static hashPassword(password, salt) {
    return crypto
      .createHash('sha512')
      .update(password)
      .update(crypto.createHash('sha512').update(salt).digest('hex'))
      .digest('hex');
  }

  static hashGitHubWebhookSecret(rawBody) {
    return crypto
      .createHmac('sha256', process.env.GITHUB_WEBHOOKS_SECRET)
      .update(rawBody)
      .digest('hex');
  }
}
