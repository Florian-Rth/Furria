import { KkWayPipRoot } from './internal/layout/KkWayPipRoot';
import { KkWayPipKey } from './internal/ui/KkWayPipKey';
import { KkWayPipPlate } from './internal/ui/KkWayPipPlate';

export type { KkWayPipCorner } from './internal/logic/pip-corner';
export type { KkWayPipKeyGlyph } from './internal/ui/KkWayPipKey';

export const KkWayPip = Object.assign(KkWayPipRoot, {
  Key: KkWayPipKey,
  Plate: KkWayPipPlate,
});
