import { outputLostOf } from './output-devices';

const outputIdsOf = async (): Promise<string[]> => {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices
      .filter((device) => device.kind === 'audiooutput')
      .map((device) => `${device.groupId}:${device.deviceId}`);
  } catch {
    return [];
  }
};

const watchOutputs = (interrupt: () => void): (() => void) => {
  if (navigator.mediaDevices === undefined) {
    return () => undefined;
  }

  const devices = navigator.mediaDevices;
  let known: Promise<string[]> = outputIdsOf();
  let watching = true;
  const compare = (): void => {
    const before = known;
    known = outputIdsOf();
    void Promise.all([before, known]).then(([previous, next]) => {
      if (watching && outputLostOf(previous, next)) {
        interrupt();
      }
    });
  };

  devices.addEventListener('devicechange', compare);
  return () => {
    watching = false;
    devices.removeEventListener('devicechange', compare);
  };
};

export const watchPlaybackInterruptions = (
  audio: AudioContext,
  interrupt: () => void,
): (() => void) => {
  const onVisibility = (): void => {
    if (document.visibilityState === 'hidden') {
      interrupt();
    }
  };
  const onState = (): void => {
    if (audio.state === 'interrupted' || audio.state === 'suspended') {
      interrupt();
    }
  };
  const stopWatchingOutputs = watchOutputs(interrupt);

  document.addEventListener('visibilitychange', onVisibility);
  window.addEventListener('pagehide', interrupt);
  audio.addEventListener('statechange', onState);

  return () => {
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pagehide', interrupt);
    audio.removeEventListener('statechange', onState);
    stopWatchingOutputs();
  };
};
