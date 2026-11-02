import type { AudioPeaks } from '@furria/studio/studio-schemas';
import { AudioPeaksSchema } from '@furria/studio/studio-schemas';

export const requestAudioPeaks = async (url: string): Promise<AudioPeaks> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`The waveform answered ${response.status}.`);
  }

  return AudioPeaksSchema.parse(await response.json());
};
