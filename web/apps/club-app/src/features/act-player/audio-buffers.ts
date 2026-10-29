let sharedContext: AudioContext | null = null;
const decodedByItem = new Map<number, Promise<AudioBuffer>>();

export const sharedAudioContext = (): AudioContext => {
  sharedContext ??= new AudioContext();
  return sharedContext;
};

const decode = async (url: string): Promise<AudioBuffer> => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`The music answered ${response.status}.`);
  }

  return sharedAudioContext().decodeAudioData(await response.arrayBuffer());
};

export const audioBufferOf = (mediaItemId: number, url: string): Promise<AudioBuffer> => {
  const known = decodedByItem.get(mediaItemId);

  if (known !== undefined) {
    return known;
  }

  const decoding = decode(url);
  decodedByItem.set(mediaItemId, decoding);
  decoding.catch(() => {
    decodedByItem.delete(mediaItemId);
  });

  return decoding;
};
