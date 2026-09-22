import { KkSheetBody } from './internal/layout/KkSheetBody';
import { KkSheetRoot } from './internal/layout/KkSheetRoot';
import { KkSheetActions } from './internal/ui/KkSheetActions';

export const KkSheet = Object.assign(KkSheetRoot, {
  Body: KkSheetBody,
  Actions: KkSheetActions,
});
