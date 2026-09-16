import { kkTokens } from '../../../tokens';
import type { KkScreenActionBar } from '../../screen-declaration';

const { actionHeight, actionContextHeight } = kkTokens.shell;

export const actionBarHeightOf = (action: KkScreenActionBar): number =>
  action.context === undefined ? actionHeight : actionHeight + actionContextHeight;
