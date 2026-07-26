import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

export interface EncryptedPayload {
  ciphertext: string;
  iv: string;
  authTag: string;
  version: number;
}

export interface EncryptedBufferPayload {
  ciphertext: Buffer;
  iv: string;
  authTag: string;
  version: number;
}

export interface WrappedDataKey {
  encryptedDataKey: string;
  iv: string;
  authTag: string;
  keyVersion: number;
}

@Injectable()
export class EncryptionService {
  static readonly ENVELOPE_ENCRYPTION_VERSION = 2;
  static readonly MASTER_KEY_VERSION = 1;

  private readonly key: Buffer;

  constructor(config: ConfigService) {
    this.key = Buffer.from(
      config.getOrThrow<string>('LETTER_ENCRYPTION_KEY'),
      'base64',
    );
  }

  encrypt(plaintext: string): EncryptedPayload {
    const encrypted = this.encryptBuffer(
      Buffer.from(plaintext, 'utf8'),
      this.key,
      1,
    );

    return {
      ciphertext: encrypted.ciphertext.toString('base64'),
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      version: encrypted.version,
    };
  }

  generateDataKey(): Buffer {
    return randomBytes(32);
  }

  encryptTextWithDataKey(plaintext: string, dataKey: Buffer): EncryptedPayload {
    const encrypted = this.encryptBuffer(
      Buffer.from(plaintext, 'utf8'),
      dataKey,
      EncryptionService.ENVELOPE_ENCRYPTION_VERSION,
    );
    return {
      ciphertext: encrypted.ciphertext.toString('base64'),
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      version: encrypted.version,
    };
  }

  decryptTextWithDataKey(
    payload: Pick<EncryptedPayload, 'ciphertext' | 'iv' | 'authTag'>,
    dataKey: Buffer,
  ): string {
    return this.decryptBuffer(
      Buffer.from(payload.ciphertext, 'base64'),
      payload.iv,
      payload.authTag,
      dataKey,
    ).toString('utf8');
  }

  encryptAttachment(plaintext: Buffer, dataKey: Buffer): EncryptedBufferPayload {
    return this.encryptBuffer(
      plaintext,
      dataKey,
      EncryptionService.ENVELOPE_ENCRYPTION_VERSION,
    );
  }

  decryptAttachment(
    ciphertext: Buffer,
    iv: string,
    authTag: string,
    dataKey: Buffer,
  ): Buffer {
    return this.decryptBuffer(ciphertext, iv, authTag, dataKey);
  }

  wrapDataKey(dataKey: Buffer): WrappedDataKey {
    this.assertKey(dataKey);
    const wrapped = this.encryptBuffer(
      dataKey,
      this.key,
      EncryptionService.MASTER_KEY_VERSION,
    );
    return {
      encryptedDataKey: wrapped.ciphertext.toString('base64'),
      iv: wrapped.iv,
      authTag: wrapped.authTag,
      keyVersion: EncryptionService.MASTER_KEY_VERSION,
    };
  }

  unwrapDataKey(wrapped: WrappedDataKey): Buffer {
    if (wrapped.keyVersion !== EncryptionService.MASTER_KEY_VERSION) {
      throw new Error(`Unsupported master key version: ${wrapped.keyVersion}`);
    }
    const dataKey = this.decryptBuffer(
      Buffer.from(wrapped.encryptedDataKey, 'base64'),
      wrapped.iv,
      wrapped.authTag,
      this.key,
    );
    this.assertKey(dataKey);
    return dataKey;
  }

  private encryptBuffer(
    plaintext: Buffer,
    key: Buffer,
    version: number,
  ): EncryptedBufferPayload {
    this.assertKey(key);
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', key, iv);
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);

    return {
      ciphertext,
      iv: iv.toString('base64'),
      authTag: cipher.getAuthTag().toString('base64'),
      version,
    };
  }

  private decryptBuffer(
    ciphertext: Buffer,
    iv: string,
    authTag: string,
    key: Buffer,
  ): Buffer {
    this.assertKey(key);
    const decipher = createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(iv, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(authTag, 'base64'));
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  }

  private assertKey(key: Buffer): void {
    if (key.length !== 32) {
      throw new Error('AES-256-GCM requires a 32-byte key');
    }
  }
}
