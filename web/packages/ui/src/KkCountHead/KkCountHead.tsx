import { KkCountHeadFacts } from './internal/layout/KkCountHeadFacts';
import { KkCountHeadRoot } from './internal/layout/KkCountHeadRoot';
import { KkCountHeadSide } from './internal/layout/KkCountHeadSide';
import { KkCountHeadBadge } from './internal/ui/KkCountHeadBadge';
import { KkCountHeadCount } from './internal/ui/KkCountHeadCount';
import { KkCountHeadFact } from './internal/ui/KkCountHeadFact';
import { KkCountHeadNote } from './internal/ui/KkCountHeadNote';

export const KkCountHead = Object.assign(KkCountHeadRoot, {
  Count: KkCountHeadCount,
  Facts: KkCountHeadFacts,
  Note: KkCountHeadNote,
  Fact: KkCountHeadFact,
  Badge: KkCountHeadBadge,
  Side: KkCountHeadSide,
});
