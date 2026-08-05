import { KkStatRowItem } from './internal/layout/KkStatRowItem';
import { KkStatRowRoot } from './internal/layout/KkStatRowRoot';
import { KkStatRowLabel } from './internal/ui/KkStatRowLabel';
import { KkStatRowValue } from './internal/ui/KkStatRowValue';

export const KkStatRow = Object.assign(KkStatRowRoot, {
  Item: KkStatRowItem,
  Value: KkStatRowValue,
  Label: KkStatRowLabel,
});
