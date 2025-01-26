import crypto from 'crypto';

class Security {
  static generateRandomIntegerFigure() {
    return Math.floor(crypto.randomBytes(1)[0] / 25.5);
  }

  static generateTemporaryCodeValue() {
    return Array(parseInt(process.env.TEMPORARY_CODE_LENGTH, 10))
      .fill(0)
      .map(() => this.generateRandomIntegerFigure())
      .join('');
  }

  static generateTokenValue() {
    return crypto.randomBytes(process.env.TOKEN_LENGTH / 2).toString('hex');
  }

  static generateSaltValue() {
    return crypto.randomBytes(process.env.SALT_LENGTH / 2).toString('hex');
  }

  static hashPassword(password, salt) {
    return crypto
      .createHash('sha512')
      .update(password)
      .update(crypto.createHash('sha512').update(salt).digest('hex'))
      .digest('hex');
  }

  static generateUploadFileName() {
    return crypto.randomBytes(process.env.UPLOAD_NAME_LENGTH / 2).toString('hex');
  }
}

export default Security;
