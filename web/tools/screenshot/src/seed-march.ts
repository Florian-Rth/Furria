type Drums = 'roll' | 'march' | 'drive' | 'light' | 'none';

interface Section {
  readonly name: string;
  readonly chords: readonly number[];
  readonly drums: Drums;
  readonly level: number;
  readonly melody: boolean;
  readonly stabs: boolean;
}

interface Voice {
  readonly at: number;
  readonly seconds: number;
  readonly midi: number;
  readonly gain: number;
  readonly harmonics: number;
  readonly attack: number;
}

export interface MarchSection {
  readonly name: string;
  readonly startSeconds: number;
  readonly bars: number;
}

export interface March {
  readonly wav: Buffer;
  readonly bpm: number;
  readonly barSeconds: number;
  readonly sections: readonly MarchSection[];
}

const SAMPLE_RATE = 22_050;
const BPM = 140;
const BEATS_PER_BAR = 4;
const BEAT_SECONDS = 60 / BPM;
const BAR_SECONDS = BEAT_SECONDS * BEATS_PER_BAR;
const TAIL_SECONDS = 2.5;
const PEAK = 0.89;
const BITS = 16;
const WAV_HEADER_BYTES = 44;
const INT16_MAX = 32_767;
const A4_MIDI = 69;
const A4_HZ = 440;
const SEMITONES = 12;
const TAU = 2 * Math.PI;

const BB = 58;
const C = 60;
const EB = 63;
const F = 65;
const AB = 56;
const G = 55;

const VERSE = [BB, BB, F, F, BB, BB, EB, F, BB, BB, F, F, EB, F, BB, BB] as const;
const CHORUS = [EB, EB, BB, BB, F, F, BB, BB, EB, C, F, F, EB, F, BB, BB] as const;
const TRIO = [EB, EB, BB, BB, AB, AB, EB, BB, EB, EB, BB, BB, AB, BB, EB, EB] as const;
const FINALE = [BB, EB, F, BB, G, C, F, BB, BB, EB, F, BB] as const;

const SECTIONS: readonly Section[] = [
  {
    name: 'Einmarsch',
    chords: [F, F, F, F],
    drums: 'roll',
    level: 0.55,
    melody: false,
    stabs: true,
  },
  { name: 'Marsch', chords: VERSE, drums: 'march', level: 0.7, melody: true, stabs: true },
  { name: 'Refrain', chords: CHORUS, drums: 'drive', level: 0.95, melody: true, stabs: true },
  { name: 'Pause', chords: [F, F, F, F], drums: 'light', level: 0.3, melody: false, stabs: false },
  { name: 'Trio', chords: TRIO, drums: 'light', level: 0.5, melody: true, stabs: true },
  { name: 'Marsch', chords: VERSE, drums: 'march', level: 0.8, melody: true, stabs: true },
  { name: 'Finale', chords: FINALE, drums: 'drive', level: 1, melody: true, stabs: true },
  {
    name: 'Schluss',
    chords: [BB, BB, BB, BB],
    drums: 'none',
    level: 1,
    melody: false,
    stabs: false,
  },
];

const MELODY_SHAPES: readonly (readonly number[])[] = [
  [12, 16, 19, 16],
  [19, 16, 12, 7],
  [12, 12, 16, 19],
  [24, 19, 16, 19],
];

const hzOf = (midi: number): number => A4_HZ * 2 ** ((midi - A4_MIDI) / SEMITONES);

const seededNoise = (seed: number): (() => number) => {
  let state = seed;
  return (): number => {
    state = (state * 1_664_525 + 1_013_904_223) % 4_294_967_296;
    return (state / 4_294_967_296) * 2 - 1;
  };
};

const indexOf = (seconds: number): number => Math.floor(seconds * SAMPLE_RATE);

const addVoice = (track: Float32Array, voice: Voice): void => {
  const start = indexOf(voice.at);
  const length = Math.min(indexOf(voice.seconds), track.length - start);
  const hz = hzOf(voice.midi);
  const attack = Math.max(1, indexOf(voice.attack));
  const release = Math.max(1, Math.floor(length * 0.3));
  for (let offset = 0; offset < length; offset += 1) {
    const time = offset / SAMPLE_RATE;
    const swell = Math.min(1, offset / attack) * Math.min(1, (length - offset) / release);
    let sample = 0;
    for (let harmonic = 1; harmonic <= voice.harmonics; harmonic += 1) {
      sample += Math.sin(TAU * hz * harmonic * time) / harmonic;
    }
    track[start + offset] = (track[start + offset] ?? 0) + sample * swell * voice.gain;
  }
};

const addKick = (track: Float32Array, at: number, gain: number): void => {
  const start = indexOf(at);
  const length = Math.min(indexOf(0.32), track.length - start);
  let phase = 0;
  for (let offset = 0; offset < length; offset += 1) {
    const time = offset / SAMPLE_RATE;
    phase += (TAU * (45 + 85 * Math.exp(-time * 28))) / SAMPLE_RATE;
    track[start + offset] =
      (track[start + offset] ?? 0) + Math.sin(phase) * Math.exp(-time * 9) * gain;
  }
};

const addSnare = (track: Float32Array, at: number, gain: number, noise: () => number): void => {
  const start = indexOf(at);
  const length = Math.min(indexOf(0.22), track.length - start);
  for (let offset = 0; offset < length; offset += 1) {
    const time = offset / SAMPLE_RATE;
    const body = Math.sin(TAU * 185 * time) * Math.exp(-time * 30);
    const rattle = noise() * Math.exp(-time * 16);
    track[start + offset] = (track[start + offset] ?? 0) + (body * 0.5 + rattle * 0.8) * gain;
  }
};

const addHat = (track: Float32Array, at: number, gain: number, noise: () => number): void => {
  const start = indexOf(at);
  const length = Math.min(indexOf(0.05), track.length - start);
  let previous = 0;
  for (let offset = 0; offset < length; offset += 1) {
    const current = noise();
    const time = offset / SAMPLE_RATE;
    track[start + offset] =
      (track[start + offset] ?? 0) + (current - previous) * Math.exp(-time * 90) * gain;
    previous = current;
  }
};

const addDrums = (
  track: Float32Array,
  barStart: number,
  drums: Drums,
  level: number,
  progress: number,
  noise: () => number,
): void => {
  const beat = (index: number): number => barStart + index * BEAT_SECONDS;
  if (drums === 'roll') {
    for (let hit = 0; hit < 16; hit += 1) {
      addSnare(track, barStart + (hit * BEAT_SECONDS) / 4, 0.25 + 0.5 * progress, noise);
    }
    addKick(track, beat(0), 0.9 * level);
    return;
  }
  if (drums === 'none') {
    return;
  }
  const isLight = drums === 'light';
  for (let index = 0; index < BEATS_PER_BAR; index += 1) {
    if (index % 2 === 0 || drums === 'drive') {
      addKick(track, beat(index), (isLight ? 0.55 : 0.95) * Math.max(level, 0.6));
    }
    if (index % 2 === 1) {
      addSnare(track, beat(index), (isLight ? 0.25 : 0.6) * level, noise);
    }
    if (!isLight) {
      addHat(track, beat(index), 0.35 * level, noise);
      addHat(track, beat(index) + BEAT_SECONDS / 2, 0.22 * level, noise);
    }
  }
  if (drums === 'drive' && progress > 0.9) {
    for (let hit = 0; hit < 4; hit += 1) {
      addSnare(track, beat(3) + (hit * BEAT_SECONDS) / 4, 0.45 * level, noise);
    }
  }
};

const addBrass = (
  track: Float32Array,
  barStart: number,
  root: number,
  section: Section,
  bar: number,
): void => {
  const beat = (index: number): number => barStart + index * BEAT_SECONDS;
  addVoice(track, {
    at: beat(0),
    seconds: BEAT_SECONDS * 0.9,
    midi: root - 24,
    gain: 0.35 * section.level,
    harmonics: 5,
    attack: 0.02,
  });
  addVoice(track, {
    at: beat(2),
    seconds: BEAT_SECONDS * 0.9,
    midi: root - 17,
    gain: 0.3 * section.level,
    harmonics: 5,
    attack: 0.02,
  });
  if (section.stabs) {
    for (const index of [1, 3]) {
      for (const interval of [0, 4, 7]) {
        addVoice(track, {
          at: beat(index),
          seconds: 0.16,
          midi: root - 12 + interval,
          gain: 0.11 * section.level,
          harmonics: 7,
          attack: 0.012,
        });
      }
    }
  }
  if (section.melody) {
    const shape = MELODY_SHAPES[bar % MELODY_SHAPES.length] ?? [];
    shape.forEach((interval, index) => {
      addVoice(track, {
        at: beat(index),
        seconds: BEAT_SECONDS * 0.85,
        midi: root + interval - 12,
        gain: 0.16 * section.level,
        harmonics: 8,
        attack: 0.03,
      });
    });
  }
};

const addFinalChord = (track: Float32Array, at: number): void => {
  for (const interval of [-24, -12, -5, 0, 4, 7, 12]) {
    addVoice(track, {
      at,
      seconds: BAR_SECONDS * 2.5,
      midi: BB + interval,
      gain: 0.14,
      harmonics: 7,
      attack: 0.02,
    });
  }
  addKick(track, at, 1);
};

const wavOf = (track: Float32Array): Buffer => {
  const loudest = track.reduce((peak, sample) => Math.max(peak, Math.abs(sample)), 0);
  const scale = loudest === 0 ? 0 : (PEAK / loudest) * INT16_MAX;
  const dataBytes = track.length * 2;
  const wav = Buffer.alloc(WAV_HEADER_BYTES + dataBytes);
  wav.write('RIFF', 0, 'ascii');
  wav.writeUInt32LE(36 + dataBytes, 4);
  wav.write('WAVE', 8, 'ascii');
  wav.write('fmt ', 12, 'ascii');
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(SAMPLE_RATE, 24);
  wav.writeUInt32LE(SAMPLE_RATE * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(BITS, 34);
  wav.write('data', 36, 'ascii');
  wav.writeUInt32LE(dataBytes, 40);
  track.forEach((sample, index) => {
    wav.writeInt16LE(
      Math.round(Math.max(-1, Math.min(1, (sample / INT16_MAX) * scale)) * INT16_MAX),
      WAV_HEADER_BYTES + index * 2,
    );
  });
  return wav;
};

export const carnivalMarch = (): March => {
  const totalBars = SECTIONS.reduce((bars, section) => bars + section.chords.length, 0);
  const track = new Float32Array(Math.ceil((totalBars * BAR_SECONDS + TAIL_SECONDS) * SAMPLE_RATE));
  const noise = seededNoise(1111);
  const sections: MarchSection[] = [];
  let bar = 0;
  for (const section of SECTIONS) {
    sections.push({
      name: section.name,
      startSeconds: bar * BAR_SECONDS,
      bars: section.chords.length,
    });
    section.chords.forEach((root, index) => {
      const barStart = (bar + index) * BAR_SECONDS;
      addDrums(track, barStart, section.drums, section.level, index / section.chords.length, noise);
      if (section.drums === 'none') {
        if (index === 0) {
          addFinalChord(track, barStart);
        }
        return;
      }
      addBrass(track, barStart, root, section, bar + index);
    });
    bar += section.chords.length;
  }
  return { wav: wavOf(track), bpm: BPM, barSeconds: BAR_SECONDS, sections };
};
