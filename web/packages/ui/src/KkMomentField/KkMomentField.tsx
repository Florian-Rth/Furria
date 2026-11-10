import { KkMomentFieldHead } from './internal/layout/KkMomentFieldHead';
import { KkMomentFieldRoot } from './internal/layout/KkMomentFieldRoot';
import { KkMomentFieldAction } from './internal/ui/KkMomentFieldAction';
import { KkMomentFieldLabel } from './internal/ui/KkMomentFieldLabel';
import { KkMomentFieldPicker } from './internal/ui/KkMomentFieldPicker';

export type { KkDateQuickChoice } from '../internal/date-field';

export const KkMomentField = Object.assign(KkMomentFieldRoot, {
  Head: KkMomentFieldHead,
  Label: KkMomentFieldLabel,
  Action: KkMomentFieldAction,
  Picker: KkMomentFieldPicker,
});
