import { KkPassDetailsRoot } from './internal/layout/KkPassDetailsRoot';
import { KkPassDetailsGroup } from './internal/ui/KkPassDetailsGroup';
import { KkPassDetailsHead } from './internal/ui/KkPassDetailsHead';
import { KkPassDetailsNames } from './internal/ui/KkPassDetailsNames';

export type { KkPassDetailsName } from './internal/ui/KkPassDetailsNames';

export const KkPassDetails = Object.assign(KkPassDetailsRoot, {
  Head: KkPassDetailsHead,
  Group: KkPassDetailsGroup,
  Names: KkPassDetailsNames,
});
