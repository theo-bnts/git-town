import { ProxyAgent, fetch as undiciFetch } from 'undici';

export default class Proxy {
  static fetch(url, options) {
    // WARNING: For development purposes only
    undiciFetch(url, {
      ...options,
      dispatcher: new ProxyAgent({
        uri: `http://${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`,
        requestTls: {
          rejectUnauthorized: false,
        },
      }),
    })
      .then((response) => {
        console.log('Proxy request', url, options);
        console.log('Proxy response', response);
      });

    return undiciFetch(url, {
      ...options,
      dispatcher: new ProxyAgent({
        uri: `http://${process.env.PROXY_HOST}:${process.env.PROXY_PORT}`,
        requestTls: {
          rejectUnauthorized: false,
        },
      }),
    });
  }
}
