import type { AudioPeaks } from './schemas';
import { AudioPeaksSchema } from './schemas';

export const requestAudioPeaks = async (url: string): Promise<AudioPeaks> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`The waveform answered ${response.status}.`);
  }

  return AudioPeaksSchema.parse(await response.json());
};
