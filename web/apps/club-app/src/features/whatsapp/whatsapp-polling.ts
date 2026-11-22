import type { WhatsAppState } from './schemas';

export type WhatsAppPollPace = 'linking' | 'settled' | 'none';

const PACE_DELAYS: Record<WhatsAppPollPace, number | false> = {
  linking: 3000,
  settled: 60_000,
  none: false,
};

export const overviewPollPaceOf = (state: WhatsAppState | undefined): WhatsAppPollPace => {
  switch (state) {
    case 'starting':
    case 'scanQrCode':
      return 'linking';
    case 'off':
      return 'none';
    default:
      return 'settled';
  }
};

export const overviewPollDelayOf = (state: WhatsAppState | undefined): number | false =>
  PACE_DELAYS[overviewPollPaceOf(state)];
