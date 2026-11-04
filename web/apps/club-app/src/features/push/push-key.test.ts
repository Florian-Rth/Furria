import { describe, expect, it } from 'vitest';
import { applicationServerKeyOf } from './push-key';

describe('applicationServerKeyOf', () => {
  it.each<[string, number[]]>([
    ['AQID', [1, 2, 3]],
    ['-_8', [251, 255]],
    ['_w', [255]],
  ])('decodes %s', (encoded, bytes) => {
    expect([...applicationServerKeyOf(encoded)]).toEqual(bytes);
  });

  it('decodes a whole server key into its 65 octets', () => {
    const key = applicationServerKeyOf(
      'BMhR4mFcMj4K9cYVgsAKgKIGevMvrCQLSM-Jy1kqfP4iSDlC7Pa4vNiXYZKmTo4mclU-aq_1BFfX8QuI46dHofQ',
    );

    expect([key.length, key[0]]).toEqual([65, 4]);
  });
});
