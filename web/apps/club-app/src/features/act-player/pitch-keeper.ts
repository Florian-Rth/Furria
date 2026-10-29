import stretchModuleUrl from 'signalsmith-stretch?url';

export interface PitchKeeper {
  input: AudioNode;
  latencySeconds: number;
  engage: (semitones: number) => void;
  release: () => void;
}

let keeping: Promise<PitchKeeper | null> | null = null;

const createPitchKeeper = async (audio: AudioContext): Promise<PitchKeeper> => {
  const { default: createStretch } = await import('signalsmith-stretch');
  createStretch.moduleUrl = stretchModuleUrl;
  const node = await createStretch(audio);
  await node.stop();

  return {
    input: node,
    latencySeconds: await node.latency(),
    engage: (semitones) => {
      node.connect(audio.destination);
      void node.schedule({ active: true, semitones });
    },
    release: () => {
      node.disconnect();
      void node.stop();
    },
  };
};

export const pitchKeeperOf = (audio: AudioContext): Promise<PitchKeeper | null> => {
  keeping ??= createPitchKeeper(audio).catch(() => null);
  return keeping;
};
