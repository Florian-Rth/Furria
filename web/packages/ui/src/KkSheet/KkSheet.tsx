import { KkSheetActions } from './internal/layout/KkSheetActions';
import { KkSheetBody } from './internal/layout/KkSheetBody';
import { KkSheetRoot } from './internal/layout/KkSheetRoot';

export const KkSheet = Object.assign(KkSheetRoot, {
  Body: KkSheetBody,
  Actions: KkSheetActions,
});
