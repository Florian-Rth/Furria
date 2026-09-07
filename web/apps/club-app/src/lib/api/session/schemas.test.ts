import { describe, expect, it } from 'vitest';
import { SessionEndMessageSchema } from './schemas';

describe('SessionEndMessageSchema', () => {
  it.each([
    ['an expired session', { expired: true }, { expired: true }],
    ['a plain logout', { expired: false }, { expired: false }],
    ['a message without the field', {}, { expired: false }],
    ['a message with the wrong type', { expired: 'yes' }, { expired: false }],
    ['a message from an unrelated broadcast', { type: 'other' }, { expired: false }],
  ])('parses %s as %o', (_case, message, expected) => {
    expect(SessionEndMessageSchema.parse(message)).toEqual(expected);
  });
});
