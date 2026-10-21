import type { KkGlobeFeed, KkGravity, KkMotionSign, KkShakeSample, KkShakeState } from '@furria/ui';
import {
  calibrateMotionSign,
  createKkGlobeFeed,
  easeGravity,
  globeGravityOf,
  KK_SHAKE_REST,
  KK_UPRIGHT,
  motionGravity,
  orientationGravity,
  senseShake,
  shakeForceOf,
  toScreenGravity,
} from '@furria/ui';
import type { RefObject } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useGlobeSimulator } from './use-globe-simulator';

export type MotionAccess = 'unavailable' | 'needsGesture' | 'granted' | 'denied';

export interface ConfettiGlobe {
  feed: KkGlobeFeed;
  still: boolean;
  available: boolean;
  access: MotionAccess;
  requestMotion: () => void;
  sense: (sample: KkShakeSample) => void;
  lean: (device: KkGravity) => void;
}

interface PermissionGate {
  requestPermission: () => Promise<string>;
}

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const EASING = 0.3;
const DIRECT = 1;
const ORIENTATION_FALLBACK_MS = 500;

const isGated = (value: object): value is PermissionGate =>
  'requestPermission' in value && typeof value.requestPermission === 'function';

const motionAvailable = (): boolean =>
  typeof window !== 'undefined' && window.isSecureContext && 'DeviceMotionEvent' in window;

const initialAccess = (): MotionAccess => {
  if (!motionAvailable()) {
    return 'unavailable';
  }
  return isGated(DeviceMotionEvent) ? 'needsGesture' : 'granted';
};

const SIMULATOR_PARAM = 'globe';
const SIMULATOR_VALUE = 'sim';

const asksForSimulator = (): boolean =>
  import.meta.env.DEV &&
  typeof window !== 'undefined' &&
  new URLSearchParams(window.location.search).get(SIMULATOR_PARAM) === SIMULATOR_VALUE;

const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia(REDUCED_MOTION_QUERY).matches;

const screenAngle = (): number => ('orientation' in screen ? screen.orientation.angle : 0);

const senseInto = (
  feed: KkGlobeFeed,
  shakeRef: RefObject<KkShakeState>,
  sample: KkShakeSample,
): void => {
  const reading = senseShake(shakeRef.current, sample);
  shakeRef.current = reading.state;
  if (reading.shaken) {
    feed.shake();
  }
};

const tiltInto = (
  feed: KkGlobeFeed,
  gravityRef: RefObject<KkGravity>,
  device: KkGravity,
  share: number,
): void => {
  const screenGravity = globeGravityOf(toScreenGravity(device, screenAngle()));
  gravityRef.current = easeGravity(gravityRef.current, screenGravity, share);
  feed.tilt(gravityRef.current);
};

export const useConfettiGlobe = (): ConfettiGlobe => {
  const [feed] = useState<KkGlobeFeed>(createKkGlobeFeed);
  const [access, setAccess] = useState<MotionAccess>(initialAccess);
  const [still] = useState(prefersReducedMotion);
  const [simulated] = useState(asksForSimulator);
  const shakeRef = useRef<KkShakeState>(KK_SHAKE_REST);
  const gravityRef = useRef<KkGravity>(KK_UPRIGHT);

  const sense = (sample: KkShakeSample): void => {
    senseInto(feed, shakeRef, sample);
  };

  const lean = (device: KkGravity): void => {
    tiltInto(feed, gravityRef, device, DIRECT);
  };

  const requestMotion = (): void => {
    if (access !== 'needsGesture' || !isGated(DeviceMotionEvent)) {
      return;
    }
    void DeviceMotionEvent.requestPermission()
      .then((answer) => {
        setAccess(answer === 'granted' ? 'granted' : 'denied');
      })
      .catch(() => {
        setAccess('denied');
      });
  };

  useEffect(() => {
    if (access !== 'granted') {
      return;
    }
    let sign: KkMotionSign = 1;
    let orientation: KkGravity | null = null;
    let lastMotionAt = Number.NEGATIVE_INFINITY;

    const onMotion = (event: DeviceMotionEvent): void => {
      const withGravity = event.accelerationIncludingGravity;
      senseInto(feed, shakeRef, {
        at: event.timeStamp,
        force: shakeForceOf(event.acceleration, withGravity),
      });
      if (withGravity === null || withGravity.x === null || withGravity.y === null) {
        return;
      }
      lastMotionAt = event.timeStamp;
      const unsigned = motionGravity(withGravity.x, withGravity.y, 1);
      if (orientation !== null) {
        sign = calibrateMotionSign(unsigned, orientation, sign);
      }
      tiltInto(feed, gravityRef, motionGravity(withGravity.x, withGravity.y, sign), EASING);
    };
    const onOrientation = (event: DeviceOrientationEvent): void => {
      if (event.beta === null || event.gamma === null) {
        return;
      }
      orientation = orientationGravity(event.beta, event.gamma);
      if (event.timeStamp - lastMotionAt > ORIENTATION_FALLBACK_MS) {
        tiltInto(feed, gravityRef, orientation, EASING);
      }
    };

    window.addEventListener('devicemotion', onMotion);
    window.addEventListener('deviceorientation', onOrientation);

    return () => {
      window.removeEventListener('devicemotion', onMotion);
      window.removeEventListener('deviceorientation', onOrientation);
    };
  }, [access, feed]);

  useGlobeSimulator(lean, sense, simulated);

  return {
    feed,
    still,
    available: access !== 'unavailable',
    access,
    requestMotion,
    sense,
    lean,
  };
};
