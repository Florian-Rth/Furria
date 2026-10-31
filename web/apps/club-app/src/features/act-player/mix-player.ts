import { audioBufferOf, sharedAudioContext } from './audio-buffers';
import type { CountIn } from './count-in';
import { countInAt, countInOf } from './count-in';
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
const CLICK_SECONDS = 0.06;
const CLICK_PEAK_GAIN = 0.6;
const CLICK_SILENT_GAIN = 0.0001;
const CLICK_HERTZ = 1046;
const ACCENT_CLICK_HERTZ = 1568;

export type MixLoadState = 'idle' | 'loading' | 'ready' | 'failed';

export interface MixPlayerState {
  load: MixLoadState;
  playing: boolean;
  loop: TimelineRange | null;
  rate: number;
  length: number;
  countInBeats: number;
}

export interface MixPlayer {
  load: () => Promise<void>;
  play: () => void;
  pause: () => void;
  seek: (seconds: number) => void;
  setLoop: (range: TimelineRange | null) => void;
  setRate: (rate: number) => void;
  setCountIn: (beats: number) => void;
  position: () => number;
  leadCount: () => number | null;
  state: () => MixPlayerState;
  subscribe: (listener: () => void) => () => void;
  dispose: () => void;
}

interface MixRoute {
  output: AudioNode;
  delaySeconds: number;
}

interface MixClick {
  tone: OscillatorNode;
  endsAt: number;
}

interface MixLead {
  musicStart: number;
  countIn: CountIn;
}

const leadStartOf = (lead: MixLead): number => lead.musicStart - lead.countIn.leadSeconds;

const scheduleClick = (audio: AudioContext, at: number, accent: boolean): MixClick => {
  const tone = audio.createOscillator();
  const level = audio.createGain();
  tone.frequency.value = accent ? ACCENT_CLICK_HERTZ : CLICK_HERTZ;
  level.gain.setValueAtTime(CLICK_SILENT_GAIN, at);
  level.gain.exponentialRampToValueAtTime(CLICK_PEAK_GAIN, at + CLICK_SECONDS / 6);
  level.gain.exponentialRampToValueAtTime(CLICK_SILENT_GAIN, at + CLICK_SECONDS);
  tone.connect(level);
  level.connect(audio.destination);
  tone.start(at);
  tone.stop(at + CLICK_SECONDS);
  tone.onended = () => {
    tone.disconnect();
    level.disconnect();
  };

  return { tone, endsAt: at + CLICK_SECONDS };
};

const clampTo = (seconds: number, length: number): number => Math.min(Math.max(0, seconds), length);

export const createMixPlayer = (segments: readonly MusicSegment[]): MixPlayer => {
  const length = musicLengthOf(segments);
  const listeners = new Set<() => void>();
  const buffers = new Map<number, AudioBuffer>();
  let sources: AudioBufferSourceNode[] = [];
  let clicks: MixClick[] = [];
  let leads: MixLead[] = [];
  let runs: MixRun[] = [];
  let watch: ReturnType<typeof setInterval> | null = null;
  let restingAt = 0;
  let keeper: PitchKeeper | null = null;
  let route: MixRoute | null = null;
  let current: MixPlayerState = {
    load: 'idle',
    playing: false,
    loop: null,
    rate: 1,
    length,
    countInBeats: 0,
  };

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
    for (const { tone } of clicks) {
      tone.stop();
      tone.disconnect();
    }
    clicks = [];
    leads = [];
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

  const leadBefore = (from: number, musicStart: number): number => {
    const countIn = countInOf(segments, from, current.rate, current.countInBeats);

    if (countIn === null) {
      return musicStart;
    }

    const audio = sharedAudioContext();
    const counted = musicStart + countIn.leadSeconds;
    const keptSince = audio.currentTime - FINISHED_RUN_GRACE_SECONDS;
    clicks = [
      ...clicks.filter((click) => click.endsAt >= keptSince),
      ...countIn.clicks.map((click, index) =>
        scheduleClick(audio, musicStart + click.offsetSeconds, index === 0),
      ),
    ];
    leads = [
      ...leads.filter((kept) => kept.musicStart >= keptSince),
      { musicStart: counted, countIn },
    ];

    return counted;
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
        scheduledUntil = runEndOf(
          scheduleRun(loop.start, loop.end, leadBefore(loop.start, scheduledUntil)),
        );
      }
      return;
    }

    if (loop === null && audio.currentTime >= runEndOf(last)) {
      silence();
      restingAt = last.to;
      publish({ playing: false });
    }
  };

  const startFrom = (from: number, counted = true): void => {
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
      counted
        ? leadBefore(range.start, audio.currentTime + START_LATENCY_SECONDS + route.delaySeconds)
        : audio.currentTime + START_LATENCY_SECONDS + route.delaySeconds,
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
          startFrom(position(), false);
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
        startFrom(at, false);
      }
    },
    setCountIn: (beats) => {
      publish({ countInBeats: beats });
    },
    position,
    leadCount: () => {
      if (!current.playing) {
        return null;
      }

      const now = sharedAudioContext().currentTime;
      const lead = leads.find(
        (candidate) => now >= leadStartOf(candidate) && now < candidate.musicStart,
      );

      return lead === undefined ? null : countInAt(lead.countIn, now - leadStartOf(lead));
    },
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
