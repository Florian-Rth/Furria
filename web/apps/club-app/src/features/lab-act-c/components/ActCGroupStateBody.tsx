import { KkNote } from '@furria/ui/KkNote';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import type { ActCGroupState } from '../hooks/use-act-c-group';
import { ActCGroupBody } from './ActCGroupBody';

const SKELETON_LINES = 8;
const MISSING = 'Diese Gruppe gibt es nicht.';
const DENIED = 'Diese Gruppe kannst du nicht sehen.';

interface ActCGroupStateBodyProps {
  state: ActCGroupState;
}

export const ActCGroupStateBody: FC<ActCGroupStateBodyProps> = ({ state }) => {
  switch (state.kind) {
    case 'ready':
      return <ActCGroupBody view={state.view} />;
    case 'denied':
      return <KkNote>{DENIED}</KkNote>;
    case 'missing':
      return <KkNote>{MISSING}</KkNote>;
    case 'loading':
      return <KkSkeletonBlock lines={SKELETON_LINES} />;
  }
};
