import { sharedAudioContext } from './audio-context';
import type { CachedMedia } from './media-cache';
import { evictionsOf } from './media-cache';

const AUDIO_CACHE_BYTES = 256 * 1024 * 1024;
const BYTES_PER_SAMPLE = Float32Array.BYTES_PER_ELEMENT;

export interface MediaLoader {
  audioBuffer: (mediaItemId: number, url: string) => Promise<AudioBuffer>;
}

interface CachedAudio {
  decoding: Promise<AudioBuffer>;
  bytes: number;
  usedAt: number;
}

const decodeAudio = async (url: string): Promise<AudioBuffer> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`The music answered ${response.status}.`);
  }

  return sharedAudioContext().decodeAudioData(await response.arrayBuffer());
};

const bytesOf = (buffer: AudioBuffer): number =>
  buffer.length * buffer.numberOfChannels * BYTES_PER_SAMPLE;

export const createMediaLoader = (budgetBytes: number): MediaLoader => {
  const cache = new Map<number, CachedAudio>();
  let clock = 0;

  const touch = (entry: CachedAudio): void => {
    clock += 1;
    entry.usedAt = clock;
  };

  const evictFor = (keptKey: number): void => {
    const entries: CachedMedia[] = [...cache].map(([key, entry]) => ({
      key,
      bytes: entry.bytes,
      usedAt: entry.usedAt,
    }));

    for (const key of evictionsOf(entries, budgetBytes, keptKey)) {
      cache.delete(key);
    }
  };

  return {
    audioBuffer: (mediaItemId, url) => {
      const known = cache.get(mediaItemId);

      if (known !== undefined) {
        touch(known);
        return known.decoding;
      }

      const decoding = decodeAudio(url);
      const entry: CachedAudio = { decoding, bytes: 0, usedAt: 0 };
      touch(entry);
      cache.set(mediaItemId, entry);
      void decoding.then(
        (buffer) => {
          entry.bytes = bytesOf(buffer);
          evictFor(mediaItemId);
        },
        () => {
          cache.delete(mediaItemId);
        },
      );

      return decoding;
    },
  };
};

export const studioMediaLoader: MediaLoader = createMediaLoader(AUDIO_CACHE_BYTES);
