import { HttpsProxyAgent } from 'https-proxy-agent';

export default class OctokitAuth {
  static https() {
    return new HttpsProxyAgent({
      host: process.env.PROXY_HOST,
      port: Number(process.env.PROXY_PORT),
    });
  }
}
