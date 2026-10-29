import { audioBufferOf, sharedAudioContext } from './audio-buffers';
import type { MixRun } from './mix-schedule';
import {
  mixPiecesOf,
  pitchCorrectionOf,
  playRangeOf,
  positionInRuns,
  runEndOf,
} from './mix-schedule';
import type { MusicSegment, TimelineRange } from './music-timeline';
import { musicLengthOf } from './music-timeline';
import type { PitchKeeper } from './pitch-keeper';
import { pitchKeeperOf } from './pitch-keeper';

const START_LATENCY_SECONDS = 0.05;
const LOOKAHEAD_SECONDS = 3;
const WATCH_INTERVAL_MS = 200;
const FINISHED_RUN_GRACE_SECONDS = 1;

export type MixLoadState = 'idle' | 'loading' | 'ready' | 'failed';

export interface MixPlayerState {
  load: MixLoadState;
  playing: boolean;
  loop: TimelineRange | null;
  rate: number;
  length: number;
}

export interface MixPlayer {
  load: () => Promise<void>;
  play: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  setLoop: (range: TimelineRange | null) => void;
  setRate: (rate: number) => void;
  position: () => number;
  state: () => MixPlayerState;
  subscribe: (listener: () => void) => () => void;
  dispose: () => void;
}

interface MixRoute {
  output: AudioNode;
  delaySeconds: number;
}

const clampTo = (seconds: number, length: number): number => Math.min(Math.max(0, seconds), length);

export const createMixPlayer = (segments: readonly MusicSegment[]): MixPlayer => {
  const length = musicLengthOf(segments);
  const listeners = new Set<() => void>();
  const buffers = new Map<number, AudioBuffer>();
  let sources: AudioBufferSourceNode[] = [];
  let runs: MixRun[] = [];
  let watch: ReturnType<typeof setInterval> | null = null;
  let restingAt = 0;
  let keeper: PitchKeeper | null = null;
  let route: MixRoute | null = null;
  let current: MixPlayerState = { load: 'idle', playing: false, loop: null, rate: 1, length };

  const publish = (next: Partial<MixPlayerState>): void => {
    current = { ...current, ...next };
    for (const listener of listeners) {
      listener();
    }
  };

  const position = (): number => {
    if (!current.playing) {
      return restingAt;
    }

    return positionInRuns(runs, sharedAudioContext().currentTime) ?? restingAt;
  };

  const silence = (): void => {
    for (const source of sources) {
      source.stop();
      source.disconnect();
    }
    sources = [];
    runs = [];
    keeper?.release();
    if (watch !== null) {
      clearInterval(watch);
      watch = null;
    }
  };

  const routeFor = (audio: AudioContext, rate: number): MixRoute => {
    const correction = pitchCorrectionOf(rate);

    if (keeper === null || correction === 0) {
      return { output: audio.destination, delaySeconds: 0 };
    }

    keeper.engage(correction);
    return { output: keeper.input, delaySeconds: keeper.latencySeconds };
  };

  const scheduleRun = (from: number, to: number, contextStart: number): MixRun => {
    const audio = sharedAudioContext();
    const run: MixRun = { contextStart, from, to, rate: current.rate };
    const { output, delaySeconds } = route ?? { output: audio.destination, delaySeconds: 0 };

    for (const piece of mixPiecesOf(segments, from, to)) {
      const buffer = buffers.get(piece.mediaItemId);

      if (buffer !== undefined) {
        const source = audio.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = run.rate;
        source.connect(output);
        source.start(
          contextStart - delaySeconds + (piece.timelineStart - from) / run.rate,
          piece.sourceOffset,
          piece.duration,
        );
        source.onended = () => {
          sources = sources.filter((playing) => playing !== source);
        };
        sources.push(source);
      }
    }

    const keptSince = audio.currentTime - FINISHED_RUN_GRACE_SECONDS;
    runs = [...runs.filter((kept) => runEndOf(kept) >= keptSince), run];
    return run;
  };

  const keepGoing = (): void => {
    const audio = sharedAudioContext();
    const last = runs.at(-1);

    if (last === undefined) {
      return;
    }

    const loop = current.loop;

    if (loop !== null && loop.end > loop.start) {
      let scheduledUntil = runEndOf(last);
      while (scheduledUntil - audio.currentTime < LOOKAHEAD_SECONDS) {
        scheduledUntil = runEndOf(scheduleRun(loop.start, loop.end, scheduledUntil));
      }
      return;
    }

    if (loop === null && audio.currentTime >= runEndOf(last)) {
      silence();
      restingAt = last.to;
      publish({ playing: false });
    }
  };

  const startFrom = (from: number): void => {
    const audio = sharedAudioContext();
    silence();
    const range = playRangeOf(clampTo(from, length), current.loop, length);

    if (range.end - range.start <= 0) {
      restingAt = range.start;
      publish({ playing: false });
      return;
    }

    restingAt = range.start;
    void audio.resume();
    route = routeFor(audio, current.rate);
    scheduleRun(
      range.start,
      range.end,
      audio.currentTime + START_LATENCY_SECONDS + route.delaySeconds,
    );
    watch = setInterval(keepGoing, WATCH_INTERVAL_MS);
    publish({ playing: true });
  };

  return {
    load: async () => {
      if (current.load === 'loading' || current.load === 'ready') {
        return;
      }

      publish({ load: 'loading' });
      void pitchKeeperOf(sharedAudioContext()).then((ready) => {
        keeper = ready;
        if (ready !== null && current.playing && pitchCorrectionOf(current.rate) !== 0) {
          startFrom(position());
        }
      });
      try {
        await Promise.all(
          segments
            .filter((segment) => segment.audible)
            .map(async (segment) => {
              buffers.set(
                segment.mediaItemId,
                await audioBufferOf(segment.mediaItemId, segment.audioUrl),
              );
            }),
        );
        publish({ load: 'ready' });
      } catch {
        publish({ load: 'failed' });
      }
    },
    play: () => {
      if (current.load !== 'ready' || current.playing) {
        return;
      }
      startFrom(restingAt >= length ? 0 : restingAt);
    },
    pause: () => {
      restingAt = position();
      silence();
      publish({ playing: false });
    },
    seek: (seconds) => {
      restingAt = clampTo(seconds, length);
      if (current.playing) {
        startFrom(restingAt);
      } else {
        publish({});
      }
    },
    setLoop: (range) => {
      const at = position();
      publish({ loop: range });
      if (current.playing) {
        startFrom(at);
      } else if (range !== null && (at < range.start || at >= range.end)) {
        restingAt = range.start;
        publish({});
      }
    },
    setRate: (rate) => {
      const at = position();
      publish({ rate });
      if (current.playing) {
        startFrom(at);
      }
    },
    position,
    state: () => current,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    dispose: () => {
      restingAt = position();
      silence();
      publish({ playing: false });
    },
  };
};
