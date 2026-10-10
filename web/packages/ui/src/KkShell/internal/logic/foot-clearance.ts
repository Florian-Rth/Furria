import { kkTokens } from '../../../tokens';
import type { KkScreenActionBar } from '../../screen-declaration';
import { actionBarHeightOf } from './action-bar-height';

const { gutter, navHeight } = kkTokens.shell;

const NAV_CLEARANCE = gutter * 2 + navHeight;
const NO_HEIGHT = 0;

interface FootClearanceInput {
  section: string | undefined;
  action: KkScreenActionBar | undefined;
  hasFoot: boolean;
  measured: number | null;
}

export const footClearanceOf = ({
  section,
  action,
  hasFoot,
  measured,
}: FootClearanceInput): number => {
  if (hasFoot) {
    return measured === null || measured <= NO_HEIGHT ? gutter : gutter * 2 + Math.ceil(measured);
  }
  if (action !== undefined) {
    const height =
      measured === null || measured <= NO_HEIGHT ? actionBarHeightOf(action) : measured;

    return gutter * 2 + Math.ceil(height);
  }

  return section === undefined ? gutter : NAV_CLEARANCE;
};
