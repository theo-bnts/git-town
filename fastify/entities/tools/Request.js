import authHeader from 'auth-header';

import Token from '../Token.js';

export default class Request {
  static async isAuthenticated(request) {
    if (request.headers.authorization === undefined || request.headers.authorization === null) {
      return false;
    }

    if (!request.headers.authorization.match(process.env.TOKEN_PATTERN)) {
      return false;
    }

    const auth = authHeader.parse(request.headers.authorization);

    return Token.isValidValue(auth.token);
  }

  static async getUsedToken(request) {
    const auth = authHeader.parse(request.headers.authorization);

    return Token.fromValue(auth.token);
  }
}
