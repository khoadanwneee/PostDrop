import { ConfigService } from '@nestjs/config';
import { createDecipheriv } from 'crypto';
import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  const key = Buffer.alloc(32, 7);
  const config = {
    getOrThrow: jest.fn().mockReturnValue(key.toString('base64')),
  } as unknown as ConfigService;
  const service = new EncryptionService(config);

  it('encrypts content with AES-256-GCM and produces decryptable ciphertext', () => {
    const plaintext = 'A letter for my future self.';
    const encrypted = service.encrypt(plaintext);
    const decipher = createDecipheriv(
      'aes-256-gcm',
      key,
      Buffer.from(encrypted.iv, 'base64'),
    );
    decipher.setAuthTag(Buffer.from(encrypted.authTag, 'base64'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encrypted.ciphertext, 'base64')),
      decipher.final(),
    ]).toString('utf8');

    expect(decrypted).toBe(plaintext);
    expect(encrypted.version).toBe(1);
  });

  it('uses a fresh IV for every encryption', () => {
    const first = service.encrypt('same content');
    const second = service.encrypt('same content');

    expect(first.iv).not.toBe(second.iv);
    expect(first.ciphertext).not.toBe(second.ciphertext);
  });
});
