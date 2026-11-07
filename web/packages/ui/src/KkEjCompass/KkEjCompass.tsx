import { KkEjCompassRoot } from './internal/layout/KkEjCompassRoot';
import { KkEjCompassArrow } from './internal/ui/KkEjCompassArrow';
import { KkEjCompassFree } from './internal/ui/KkEjCompassFree';

export const KkEjCompass = Object.assign(KkEjCompassRoot, {
  Arrow: KkEjCompassArrow,
  Free: KkEjCompassFree,
});
