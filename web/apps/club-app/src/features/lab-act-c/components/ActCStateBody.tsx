import { KkNote } from '@furria/ui/KkNote';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { ACT_DENIED_MESSAGE } from '@/features/acts/act-page-copy';
import { ACT_NOT_FOUND } from '../act-c-copy';
import type { ActCPageState } from '../hooks/use-act-c-page';
import { ActCBody } from './ActCBody';

const SKELETON_LINES = 8;

interface ActCStateBodyProps {
  state: ActCPageState;
}

export const ActCStateBody: FC<ActCStateBodyProps> = ({ state }) => {
  switch (state.kind) {
    case 'ready':
      return <ActCBody view={state.view} />;
    case 'denied':
      return <KkNote>{ACT_DENIED_MESSAGE}</KkNote>;
    case 'missing':
      return <KkNote>{ACT_NOT_FOUND}</KkNote>;
    case 'loading':
      return <KkSkeletonBlock lines={SKELETON_LINES} />;
  }
};
