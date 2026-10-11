import { KK_PRESS_BEATS_MS } from './press-beats';

export type CeremonyOutcome = 'published' | 'failed';

export type CeremonyBeat = 'strike' | 'cut' | 'stamp' | 'settled' | 'finished' | 'slip' | 'recover';

export interface CeremonyCue {
  beat: CeremonyBeat;
  atMs: number;
}

const {
  registerAtLeast,
  strike,
  inkRoll,
  cut,
  stamp,
  slip,
  rain,
  rainFade,
  stampShown,
  stampLeave,
} = KK_PRESS_BEATS_MS;

export const ceremonyCuesOf = (outcome: CeremonyOutcome, elapsedMs: number): CeremonyCue[] => {
  const registerEndsAt = Math.max(registerAtLeast - elapsedMs, 0);

  if (outcome === 'failed') {
    return [
      { beat: 'slip', atMs: registerEndsAt },
      { beat: 'recover', atMs: registerEndsAt + slip },
    ];
  }

  const cutAt = registerEndsAt + strike + inkRoll;
  const stampAt = cutAt + cut;
  const finishedAt = Math.max(stampAt + stampShown + stampLeave, cutAt + rain + rainFade);

  return [
    { beat: 'strike', atMs: registerEndsAt },
    { beat: 'cut', atMs: cutAt },
    { beat: 'stamp', atMs: stampAt },
    { beat: 'settled', atMs: stampAt + stamp },
    { beat: 'finished', atMs: finishedAt },
  ];
};
