import { Injectable, BadGatewayException } from '@nestjs/common';
import * as https from 'https';
import * as http from 'http';
import { URL } from 'url';

const USER_AGENTS = [
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
];

const REFERER = 'https://music.163.com/';

@Injectable()
export class MusicService {
  async proxySong(songId: string, res: any) {
    if (!/^\d+$/.test(songId)) {
      throw new BadGatewayException('无效的歌曲ID');
    }

    const outerUrl = `https://music.163.com/song/media/outer/url?id=${songId}.mp3`;
    let mp3Url: string | null = null;

    for (const ua of USER_AGENTS) {
      try {
        const result = await this.tryResolveHead(outerUrl, ua);
        if (result && this.looksLikeMp3Url(result)) {
          mp3Url = result;
          break;
        }
      } catch {
        // 试下一个 UA
      }
    }

    if (!mp3Url) {
      for (const ua of USER_AGENTS) {
        try {
          const result = await this.tryResolveGet(outerUrl, ua);
          if (result && this.looksLikeMp3Url(result)) {
            mp3Url = result;
            break;
          }
        } catch {
          // 试下一个 UA
        }
      }
    }

    if (!mp3Url) {
      throw new BadGatewayException('无法获取音频地址');
    }

    return this.streamMp3(mp3Url, res);
  }

  private looksLikeMp3Url(url: string): boolean {
    if (!url) return false;
    const lower = url.toLowerCase();
    if (lower.indexOf('.mp3') !== -1) return true;
    if (lower.indexOf('music.126.net') !== -1) return true;
    if (lower.indexOf('/404') !== -1) return false;
    if (lower.indexOf('music.163.com') !== -1 && lower.indexOf('song') === -1) return false;
    return false;
  }

  private tryResolveHead(url: string, ua: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const parsed = new URL(url);
      const lib = parsed.protocol === 'https:' ? https : http;

      const options: https.RequestOptions = {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: 'HEAD',
        headers: {
          'User-Agent': ua,
          Accept: 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8',
          Referer: REFERER,
        },
      };

      const req = lib.request(options, (upstreamRes) => {
        upstreamRes.resume();
        const statusCode = upstreamRes.statusCode || 0;
        const location = upstreamRes.headers.location;

        if ((statusCode === 301 || statusCode === 302 || statusCode === 307 || statusCode === 308) && location) {
          let nextUrl = location;
          if (nextUrl.startsWith('/')) {
            nextUrl = `${parsed.protocol}//${parsed.host}${nextUrl}`;
          }
          resolve(nextUrl);
        } else if (statusCode >= 200 && statusCode < 300) {
          resolve(url);
        } else {
          resolve(null);
        }
      });

      req.on('error', () => resolve(null));
      req.setTimeout(8000, () => { req.destroy(); resolve(null); });
      req.end();
    });
  }

  private tryResolveGet(url: string, ua: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const parsed = new URL(url);
      const lib = parsed.protocol === 'https:' ? https : http;

      const options: https.RequestOptions = {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers: {
          'User-Agent': ua,
          Accept: 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8',
          Referer: REFERER,
          Range: 'bytes=0-0',
        },
      };

      const req = lib.request(options, (upstreamRes) => {
        const statusCode = upstreamRes.statusCode || 0;
        const location = upstreamRes.headers.location;

        if ((statusCode === 301 || statusCode === 302 || statusCode === 307 || statusCode === 308) && location) {
          upstreamRes.destroy();
          let nextUrl = location;
          if (nextUrl.startsWith('/')) {
            nextUrl = `${parsed.protocol}//${parsed.host}${nextUrl}`;
          }
          resolve(nextUrl);
          return;
        }

        if (statusCode >= 200 && statusCode < 300) {
          upstreamRes.destroy();
          resolve(url);
          return;
        }

        upstreamRes.resume();
        resolve(null);
      });

      req.on('error', () => resolve(null));
      req.setTimeout(8000, () => { req.destroy(); resolve(null); });
      req.end();
    });
  }

  private streamMp3(url: string, res: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const parsed = new URL(url);
      const lib = parsed.protocol === 'https:' ? https : http;

      const options: https.RequestOptions = {
        hostname: parsed.hostname,
        port: parsed.port || (parsed.protocol === 'https:' ? 443 : 80),
        path: parsed.pathname + parsed.search,
        method: 'GET',
        headers: {
          'User-Agent': USER_AGENTS[0],
          Accept: 'audio/mpeg,audio/*;q=0.9,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          Referer: REFERER,
          'Icy-MetaData': '1',
        },
      };

      const req = lib.request(options, (upstreamRes) => {
        const statusCode = upstreamRes.statusCode || 0;

        if (statusCode >= 400) {
          upstreamRes.resume();
          reject(new BadGatewayException(`上游返回 ${statusCode}`));
          return;
        }

        const contentType = upstreamRes.headers['content-type'] || 'audio/mpeg';
        const contentLength = upstreamRes.headers['content-length'];
        const acceptRanges = upstreamRes.headers['accept-ranges'];
        const contentRange = upstreamRes.headers['content-range'];

        res.status(statusCode);
        res.setHeader('Content-Type', contentType);
        res.setHeader('Cache-Control', 'public, max-age=86400');
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (contentLength) res.setHeader('Content-Length', contentLength);
        if (acceptRanges) res.setHeader('Accept-Ranges', acceptRanges);
        if (contentRange) res.setHeader('Content-Range', contentRange);

        let gotData = false;
        upstreamRes.on('data', (chunk: Buffer) => {
          if (!gotData && chunk.length > 0) {
            const firstByte = chunk[0];
            const secondByte = chunk[1];
            const isMp3 =
              firstByte === 0x49 && secondByte === 0x44 && chunk[2] === 0x33 ||
              firstByte === 0xff && (secondByte & 0xe0) === 0xe0;
            if (!isMp3) {
              upstreamRes.destroy();
              reject(new BadGatewayException('返回内容不是音频'));
              return;
            }
            gotData = true;
          }
          res.write(chunk);
        });
        upstreamRes.on('end', () => {
          if (gotData) {
            res.end();
            resolve();
          } else {
            reject(new BadGatewayException('音频流为空'));
          }
        });
        upstreamRes.on('error', (err: Error) => {
          reject(new BadGatewayException(`流式读取失败: ${err.message}`));
        });
      });

      req.on('error', (err: Error) => {
        reject(new BadGatewayException(`请求失败: ${err.message}`));
      });

      req.setTimeout(30000, () => {
        req.destroy();
        reject(new BadGatewayException('请求超时'));
      });

      req.end();
    });
  }
}
