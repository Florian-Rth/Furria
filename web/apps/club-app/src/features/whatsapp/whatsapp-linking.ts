import type { WhatsAppState } from './schemas';

export const canStartLinking = (state: WhatsAppState): boolean =>
  state === 'stopped' || state === 'failed';
