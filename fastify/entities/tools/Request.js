import authHeader from 'auth-header';

import Token from '../Token.js';
import Role from '../Role.js';

class Request {
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

  static async handleAuthenticationWithRole(request, requiredRoleKeyword) {
    if (!await Request.isAuthenticated(request)) {
      throw { statusCode: 401, code: 'INVALID_TOKEN' };
    }

    const auth = authHeader.parse(request.headers.authorization);
    const token = await Token.fromValue(auth.token);
    const userRole = token.User.Role;

    const requiredRole = await Role.fromKeyword(requiredRoleKeyword);

    if (userRole.HierarchyLevel < requiredRole.HierarchyLevel) {
      throw { statusCode: 403, code: 'INSUFFICIENT_PERMISSIONS' };
    }
  }

  static async getUsedToken(request) {
    const auth = authHeader.parse(request.headers.authorization);

    return Token.fromValue(auth.token);
  }

  static async getAuthenticatedUser(request) {
    const token = await Request.getUsedToken(request);

    return token.User;
  }
}

export default Request;
