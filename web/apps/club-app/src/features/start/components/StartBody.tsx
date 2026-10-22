import { KkPageWatermark } from '@furria/ui/KkPageWatermark';
import type { FC, ReactNode } from 'react';
import { NotAffiliatedState } from '@/features/session/components/NotAffiliatedState';
import type { StartView } from '../hooks/use-start-view';
import { StartError } from './StartError';
import { StartSkeleton } from './StartSkeleton';
import { StartTiles } from './StartTiles';

interface StartBodyProps {
  view: StartView;
  focusedDay: string | null;
  strip: ReactNode;
}

export const StartBody: FC<StartBodyProps> = ({ view, focusedDay, strip }) => {
  if (view.screen === 'board') {
    return <StartTiles board={view.board} focusedDay={focusedDay} strip={strip} />;
  }
  if (view.screen === 'error') {
    return <StartError message={view.message} onRetry={view.retry} retrying={view.retrying} />;
  }
  if (view.screen === 'skeleton') {
    return <StartSkeleton />;
  }
  if (view.screen === 'inactive') {
    return <NotAffiliatedState />;
  }
  if (view.screen === 'empty') {
    return <KkPageWatermark />;
  }

  return null;
};
