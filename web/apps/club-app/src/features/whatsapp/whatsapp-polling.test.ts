import { describe, expect, it } from 'vitest';
import type { WhatsAppState } from './schemas';
import type { WhatsAppPollPace } from './whatsapp-polling';
import { overviewPollPaceOf } from './whatsapp-polling';

describe('overviewPollPaceOf', () => {
  it.each<[WhatsAppState | undefined, WhatsAppPollPace]>([
    ['starting', 'linking'],
    ['scanQrCode', 'linking'],
    ['working', 'settled'],
    ['stopped', 'settled'],
    ['failed', 'settled'],
    ['unreachable', 'settled'],
    [undefined, 'settled'],
    ['off', 'none'],
  ])('paces %s as %s', (state, pace) => {
    expect(overviewPollPaceOf(state)).toBe(pace);
  });
});
