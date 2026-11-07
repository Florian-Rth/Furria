type AudioSessionType =
  | 'auto'
  | 'playback'
  | 'transient'
  | 'transient-solo'
  | 'ambient'
  | 'play-and-record';

interface AudioSession {
  type: AudioSessionType;
}

declare global {
  interface Navigator {
    readonly audioSession?: AudioSession;
  }
}

let sharedContext: AudioContext | null = null;

const preferPlaybackSession = (): void => {
  const session = navigator.audioSession;

  if (session !== undefined) {
    session.type = 'playback';
  }
};

export const sharedAudioContext = (): AudioContext => {
  if (sharedContext === null) {
    preferPlaybackSession();
    sharedContext = new AudioContext();
  }

  return sharedContext;
};
