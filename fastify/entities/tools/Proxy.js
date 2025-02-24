import { ProxyAgent, fetch as undiciFetch } from 'undici';

export default class Proxy {
  static fetch(url, options) {
    return undiciFetch(url, {
      ...options,
      dispatcher: new ProxyAgent({
        uri: `https://${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`,
        proxyTls: {
          rejectUnauthorized: false,
        },
        requestTls: {
          rejectUnauthorized: false,
        },
      }),
    });
  }
}
