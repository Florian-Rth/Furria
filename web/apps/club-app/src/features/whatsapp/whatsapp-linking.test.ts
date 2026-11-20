import { describe, expect, it } from 'vitest';
import type { WhatsAppState } from './schemas';
import { canStartLinking } from './whatsapp-linking';

describe('canStartLinking', () => {
  it.each<[WhatsAppState, boolean]>([
    ['stopped', true],
    ['failed', true],
    ['off', false],
    ['unreachable', false],
    ['starting', false],
    ['scanQrCode', false],
    ['working', false],
  ])('offers linking in %s: %s', (state, offered) => {
    expect(canStartLinking(state)).toBe(offered);
  });
});
