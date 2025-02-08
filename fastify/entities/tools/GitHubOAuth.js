import axios from 'axios';

class GitHubOAuth {
  static async getAccessToken(code) {
    const { data: { access_token: accessToken } } = await axios({
      method: 'POST',
      baseURL: process.env.GITHUB_OAUTH_BASE_URL,
      url: '/login/oauth/access_token',
      headers: {
        Accept: 'application/json',
      },
      data: {
        client_id: process.env.GITHUB_OAUTH_CLIENT_ID,
        client_secret: process.env.GITHUB_OAUTH_CLIENT_SECRET,
        code,
      },
    });

    if (accessToken === undefined) {
      throw new Error('Failed to get access token');
    }

    return accessToken;
  }
}

export default GitHubOAuth;
