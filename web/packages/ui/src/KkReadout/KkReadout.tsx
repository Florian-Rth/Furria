import { KkReadoutFacts } from './internal/layout/KkReadoutFacts';
import { KkReadoutLines } from './internal/layout/KkReadoutLines';
import { KkReadoutRoot } from './internal/layout/KkReadoutRoot';
import { KkReadoutFact } from './internal/ui/KkReadoutFact';
import { KkReadoutLine } from './internal/ui/KkReadoutLine';
import { KkReadoutNote } from './internal/ui/KkReadoutNote';

export const KkReadout = Object.assign(KkReadoutRoot, {
  Facts: KkReadoutFacts,
  Fact: KkReadoutFact,
  Lines: KkReadoutLines,
  Line: KkReadoutLine,
  Note: KkReadoutNote,
});
