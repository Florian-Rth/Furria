import type { KkQuietScreenAction, KkScreenActions } from '@furria/ui/screen-declaration';

export const shownActionsOf = (
  actions: readonly (KkQuietScreenAction | null)[],
): KkScreenActions | undefined => {
  const shown = actions.filter((action): action is KkQuietScreenAction => action !== null);
  const [first, second] = shown;

  if (first === undefined) {
    return undefined;
  }

  return second === undefined ? [first] : [first, second];
};
