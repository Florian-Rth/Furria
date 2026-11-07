import { KkStudioStepListDetail } from './internal/layout/KkStudioStepListDetail';
import { KkStudioStepListGroup } from './internal/layout/KkStudioStepListGroup';
import { KkStudioStepListItem } from './internal/layout/KkStudioStepListItem';
import { KkStudioStepListPair } from './internal/layout/KkStudioStepListPair';
import { KkStudioStepListPicture } from './internal/layout/KkStudioStepListPicture';
import { KkStudioStepListRoot } from './internal/layout/KkStudioStepListRoot';
import { KkStudioStepListRow } from './internal/layout/KkStudioStepListRow';
import { KkStudioStepListArrow } from './internal/ui/KkStudioStepListArrow';
import { KkStudioStepListHead } from './internal/ui/KkStudioStepListHead';
import { KkStudioStepListLead } from './internal/ui/KkStudioStepListLead';
import { KkStudioStepListNone } from './internal/ui/KkStudioStepListNone';
import { KkStudioStepListText } from './internal/ui/KkStudioStepListText';
import { KkStudioStepListThumb } from './internal/ui/KkStudioStepListThumb';

export const KkStudioStepList = Object.assign(KkStudioStepListRoot, {
  Arrow: KkStudioStepListArrow,
  Detail: KkStudioStepListDetail,
  Group: KkStudioStepListGroup,
  Head: KkStudioStepListHead,
  Item: KkStudioStepListItem,
  Lead: KkStudioStepListLead,
  None: KkStudioStepListNone,
  Pair: KkStudioStepListPair,
  Picture: KkStudioStepListPicture,
  Row: KkStudioStepListRow,
  Text: KkStudioStepListText,
  Thumb: KkStudioStepListThumb,
});
