import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, createHmac, randomBytes } from 'crypto';

@Injectable()
export class RevealTokenService {
  static readonly CAPABILITY_LIFETIME_DAYS = 30;
  static readonly SESSION_LIFETIME_MINUTES = 30;

  private readonly secret: Buffer;
  private readonly publicAppUrl: string;

  constructor(config: ConfigService) {
    this.secret = Buffer.from(
      config.getOrThrow<string>('REVEAL_TOKEN_SECRET'),
      'base64',
    );
    if (this.secret.length !== 32) {
      throw new Error('REVEAL_TOKEN_SECRET_INVALID');
    }
    this.publicAppUrl = config.getOrThrow<string>('PUBLIC_APP_URL');
  }

  capabilityToken(letterId: string): string {
    return createHmac('sha256', this.secret)
      .update(`postdrop-reveal:v1:${letterId}`, 'utf8')
      .digest('base64url');
  }

  hash(token: string): string {
    return createHash('sha256').update(token, 'utf8').digest('hex');
  }

  createSessionToken(): string {
    return randomBytes(32).toString('base64url');
  }

  capabilityExpiresAt(now = new Date()): string {
    return new Date(
      now.getTime() +
        RevealTokenService.CAPABILITY_LIFETIME_DAYS * 24 * 60 * 60 * 1000,
    ).toISOString();
  }

  sessionExpiresAt(now = new Date()): string {
    return new Date(
      now.getTime() +
        RevealTokenService.SESSION_LIFETIME_MINUTES * 60 * 1000,
    ).toISOString();
  }

  revealUrl(letterId: string): string {
    const base = new URL(this.publicAppUrl);
    if (!base.pathname.endsWith('/')) {
      base.pathname = `${base.pathname}/`;
    }
    const url = new URL(`reveal/${letterId}`, base);
    url.hash = new URLSearchParams({
      token: this.capabilityToken(letterId),
    }).toString();
    return url.toString();
  }
}
