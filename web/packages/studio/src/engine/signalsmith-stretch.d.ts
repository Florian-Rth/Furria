declare module 'signalsmith-stretch' {
  function createStretch(context: BaseAudioContext): Promise<createStretch.StretchNode>;

  namespace createStretch {
    let moduleUrl: string | undefined;

    interface StretchChange {
      active?: boolean;
      input?: number;
      output?: number;
      outputTime?: number;
      rate?: number;
      semitones?: number;
    }

    interface StretchNode extends AudioWorkletNode {
      schedule: (change: StretchChange) => Promise<StretchChange>;
      stop: (when?: number) => Promise<StretchChange>;
      latency: () => Promise<number>;
      addBuffers: (channels: Float32Array[], transfer: ArrayBuffer[]) => Promise<number>;
      dropBuffers: () => Promise<{ start: number; end: number }>;
    }
  }

  export = createStretch;
}

declare module 'signalsmith-stretch?url' {
  const url: string;
  export = url;
}
