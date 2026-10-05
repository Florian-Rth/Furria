import { KkPageWatermark } from '@furria/ui';
import type { FC } from 'react';
import { NotAffiliatedState } from '@/features/session';
import { useStartView } from '../hooks/use-start-view';
import { StartError } from './StartError';
import { StartPanels } from './StartPanels';
import { StartSkeleton } from './StartSkeleton';

export const StartBody: FC = () => {
  const view = useStartView();

  if (view.screen === 'board') {
    return <StartPanels board={view.board} />;
  }
  if (view.screen === 'error') {
    return <StartError message={view.message} onRetry={view.retry} />;
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
