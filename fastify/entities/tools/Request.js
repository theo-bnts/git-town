import authHeader from 'auth-header';

import Token from '../Token.js';

class Request {
  static async handleAuthentified(request) {
    const auth = authHeader.parse(request.headers.authorization);

    if (!(await Token.isValidValue(auth.token))) {
      throw { statusCode: 401, code: 'INVALID_TOKEN' };
    }

    const token = await Token.fromValue(auth.token);

    if (!token.isValid()) {
      throw { statusCode: 403, code: 'TOKEN_EXPIRED' };
    }
  }

  static async getUsedToken(request) {
    const auth = authHeader.parse(request.headers.authorization);

    return Token.fromValue(auth.token);
  }

  static async getAuthentifiedUser(request) {
    const token = await Request.getUsedToken(request);

    return token.User;
  }
}

export default Request;
