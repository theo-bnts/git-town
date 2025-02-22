import { ProxyAgent, fetch as undiciFetch } from 'undici';

export default class Proxy {
  static fetch(url, options) {
    return undiciFetch(url, {
      ...options,
      dispatcher: new ProxyAgent({
        uri: `http://${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`,
      }),
    });
  }
}
