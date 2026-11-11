export type KkOrbitIndex = 1 | 2 | 3;

interface OrbitPath {
  diameter: number;
  seconds: number;
  backwards: boolean;
  startShare: number;
  ink: number;
  dark: number;
}

export const ORBIT_PATHS: Record<KkOrbitIndex, OrbitPath> = {
  1: { diameter: 46, seconds: 46, backwards: false, startShare: 0.62, ink: 0.42, dark: 0.7 },
  2: { diameter: 68, seconds: 78, backwards: true, startShare: 0.3, ink: 0.3, dark: 0.54 },
  3: { diameter: 90, seconds: 124, backwards: false, startShare: 0.84, ink: 0.2, dark: 0.38 },
};

export const orbitStartDelay = (path: OrbitPath): string => `-${path.seconds * path.startShare}s`;
