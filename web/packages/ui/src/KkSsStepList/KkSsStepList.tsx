import { KkSsStepListDetail } from './internal/layout/KkSsStepListDetail';
import { KkSsStepListGroup } from './internal/layout/KkSsStepListGroup';
import { KkSsStepListItem } from './internal/layout/KkSsStepListItem';
import { KkSsStepListPair } from './internal/layout/KkSsStepListPair';
import { KkSsStepListPicture } from './internal/layout/KkSsStepListPicture';
import { KkSsStepListRoot } from './internal/layout/KkSsStepListRoot';
import { KkSsStepListRow } from './internal/layout/KkSsStepListRow';
import { KkSsStepListArrow } from './internal/ui/KkSsStepListArrow';
import { KkSsStepListHead } from './internal/ui/KkSsStepListHead';
import { KkSsStepListLead } from './internal/ui/KkSsStepListLead';
import { KkSsStepListNone } from './internal/ui/KkSsStepListNone';
import { KkSsStepListText } from './internal/ui/KkSsStepListText';
import { KkSsStepListThumb } from './internal/ui/KkSsStepListThumb';

export const KkSsStepList = Object.assign(KkSsStepListRoot, {
  Arrow: KkSsStepListArrow,
  Detail: KkSsStepListDetail,
  Group: KkSsStepListGroup,
  Head: KkSsStepListHead,
  Item: KkSsStepListItem,
  Lead: KkSsStepListLead,
  None: KkSsStepListNone,
  Pair: KkSsStepListPair,
  Picture: KkSsStepListPicture,
  Row: KkSsStepListRow,
  Text: KkSsStepListText,
  Thumb: KkSsStepListThumb,
});
