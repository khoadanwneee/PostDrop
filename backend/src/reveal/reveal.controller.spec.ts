import { RequestMethod } from '@nestjs/common';
import {
  HEADERS_METADATA,
  METHOD_METADATA,
  PATH_METADATA,
} from '@nestjs/common/constants';
import { RevealController } from './reveal.controller';

describe('RevealController security metadata', () => {
  it('uses deliberate POST routes for capability exchange and content reveal', () => {
    const exchange = RevealController.prototype.exchange;
    const content = RevealController.prototype.revealContent;

    expect(Reflect.getMetadata(METHOD_METADATA, exchange)).toBe(
      RequestMethod.POST,
    );
    expect(Reflect.getMetadata(PATH_METADATA, exchange)).toBe('exchange');
    expect(Reflect.getMetadata(METHOD_METADATA, content)).toBe(
      RequestMethod.POST,
    );
    expect(Reflect.getMetadata(PATH_METADATA, content)).toBe('content');
  });

  it('marks token and decrypted-content responses private and non-cacheable', () => {
    for (const handler of [
      RevealController.prototype.exchange,
      RevealController.prototype.revealContent,
    ]) {
      expect(Reflect.getMetadata(HEADERS_METADATA, handler)).toEqual(
        expect.arrayContaining([
          {
            name: 'Cache-Control',
            value: 'no-store, private, max-age=0',
          },
          { name: 'Pragma', value: 'no-cache' },
        ]),
      );
    }
  });
});
