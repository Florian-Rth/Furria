import { KkCompassRoot } from './internal/layout/KkCompassRoot';
import { KkCompassArrow } from './internal/ui/KkCompassArrow';
import { KkCompassFree } from './internal/ui/KkCompassFree';

export const KkCompass = Object.assign(KkCompassRoot, {
  Arrow: KkCompassArrow,
  Free: KkCompassFree,
});
