import { KkTeleprinterLines } from './internal/layout/KkTeleprinterLines';
import { KkTeleprinterRoot } from './internal/layout/KkTeleprinterRoot';
import { KkTeleprinterDay } from './internal/ui/KkTeleprinterDay';
import { KkTeleprinterFresh } from './internal/ui/KkTeleprinterFresh';
import { KkTeleprinterLine } from './internal/ui/KkTeleprinterLine';
import { KkTeleprinterMore } from './internal/ui/KkTeleprinterMore';

export const KkTeleprinter = Object.assign(KkTeleprinterRoot, {
  Fresh: KkTeleprinterFresh,
  Lines: KkTeleprinterLines,
  Day: KkTeleprinterDay,
  Line: KkTeleprinterLine,
  More: KkTeleprinterMore,
});
