import type { KkScreenActionBar, KkScreenActionContext } from '../../screen-declaration';

export const actionContextOf = (
  context: KkScreenActionBar['context'],
): KkScreenActionContext | null => {
  if (context === undefined) {
    return null;
  }

  if (typeof context === 'string') {
    return { text: context, tone: 'quiet' };
  }

  return context;
};
