import { KkStudioGInspector } from '@furria/ui/KkStudioGInspector';
import type { FC } from 'react';
import { useStudioGInspector } from '../hooks/use-studio-g-inspector';
import { INSPECTOR_LABEL } from '../studio-g-copy';
import type { StudioGDesk } from '../studio-g-desk';
import { StudioGInspectorCard } from './StudioGInspectorCard';

interface StudioGInspectorProps {
  desk: StudioGDesk;
}

export const StudioGInspector: FC<StudioGInspectorProps> = ({ desk }) => {
  const inspector = useStudioGInspector(desk);
  const card =
    inspector.shown === null ? null : (
      <StudioGInspectorCard
        key={inspector.shown.key}
        model={inspector.shown}
        onClose={inspector.close}
      />
    );
  const sheetLabel = inspector.shown?.title ?? INSPECTOR_LABEL;

  return (
    <KkStudioGInspector label={INSPECTOR_LABEL}>
      <KkStudioGInspector.Idle>
        <StudioGInspectorCard model={inspector.idle} onClose={null} />
      </KkStudioGInspector.Idle>
      <KkStudioGInspector.Sheet open={inspector.open} label={sheetLabel}>
        {card}
      </KkStudioGInspector.Sheet>
    </KkStudioGInspector>
  );
};
