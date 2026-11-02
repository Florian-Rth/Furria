/// <reference path="./signalsmith-stretch.d.ts" />
import stretchModuleUrl from 'signalsmith-stretch?url';
import type { MixRun, StretchSlice } from './mix-schedule';
import { runEndOf } from './mix-schedule';

export interface TimeStretch {
  leadSeconds: number;
  hold: (
    owner: object,
    slices: readonly StretchSlice[],
    buffers: ReadonlyMap<number, AudioBuffer>,
  ) => void;
  play: (run: MixRun) => void;
  silence: () => void;
  forget: (owner: object) => void;
}

let sharedStretch: Promise<TimeStretch | null> | null = null;

const channelsOf = (
  slice: StretchSlice,
  buffers: ReadonlyMap<number, AudioBuffer>,
): Float32Array<ArrayBuffer>[] => {
  const buffer = slice.mediaItemId === null ? undefined : buffers.get(slice.mediaItemId);

  if (buffer === undefined) {
    return [new Float32Array(slice.samples)];
  }

  return Array.from({ length: buffer.numberOfChannels }, (_, channel) => {
    const copy = new Float32Array(slice.samples);
    copy.set(
      buffer
        .getChannelData(channel)
        .subarray(slice.sourceSample, slice.sourceSample + slice.samples),
    );
    return copy;
  });
};

const createTimeStretch = async (audio: AudioContext): Promise<TimeStretch> => {
  const { default: createStretch } = await import('signalsmith-stretch');
  createStretch.moduleUrl = stretchModuleUrl;
  const node = await createStretch(audio);
  await node.stop();
  const leadSeconds = await node.latency();
  let holder: object | null = null;

  return {
    leadSeconds,
    hold: (owner, slices, buffers) => {
      if (holder === owner) {
        return;
      }

      holder = owner;
      node.connect(audio.destination);
      void node.dropBuffers();
      for (const slice of slices) {
        const channels = channelsOf(slice, buffers);
        void node.addBuffers(
          channels,
          channels.map((channel) => channel.buffer),
        );
      }
    },
    play: (run) => {
      const end = runEndOf(run);
      void node.schedule({
        active: true,
        input: run.from,
        rate: run.rate,
        semitones: 0,
        output: run.contextStart,
        outputTime: run.contextStart,
      });
      void node.schedule({ active: false, output: end, outputTime: end });
    },
    silence: () => {
      void node.stop();
    },
    forget: (owner) => {
      if (holder === owner) {
        holder = null;
        node.disconnect();
        void node.dropBuffers();
      }
    },
  };
};

export const timeStretchOf = (audio: AudioContext): Promise<TimeStretch | null> => {
  sharedStretch ??= createTimeStretch(audio).catch(() => {
    sharedStretch = null;
    return null;
  });
  return sharedStretch;
};
