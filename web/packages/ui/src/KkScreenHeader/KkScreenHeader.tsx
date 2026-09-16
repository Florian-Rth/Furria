import { KkScreenHeaderMeta } from './internal/layout/KkScreenHeaderMeta';
import { KkScreenHeaderRoot } from './internal/layout/KkScreenHeaderRoot';
import { KkScreenHeaderText } from './internal/layout/KkScreenHeaderText';
import { KkScreenHeaderVisual } from './internal/layout/KkScreenHeaderVisual';
import { KkScreenHeaderTitle } from './internal/ui/KkScreenHeaderTitle';

export const KkScreenHeader = Object.assign(KkScreenHeaderRoot, {
  Visual: KkScreenHeaderVisual,
  Text: KkScreenHeaderText,
  Title: KkScreenHeaderTitle,
  Meta: KkScreenHeaderMeta,
});
