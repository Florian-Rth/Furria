import type { FC, ReactNode } from 'react';
import { KkViewer } from '../KkViewer/KkViewer';
import type { KkViewerItem, KkViewerLabels } from '../KkViewer/viewer-types';
import { KkImageViewerActions } from './internal/layout/KkImageViewerActions';
import { KkImageViewerFooter } from './internal/layout/KkImageViewerFooter';
import { KkImageViewerHeader } from './internal/layout/KkImageViewerHeader';
import { KkImageViewerSurface } from './internal/layout/KkImageViewerSurface';
import { KkImageViewerTitle } from './internal/ui/KkImageViewerTitle';

const STEP_PLACEMENT = { alignSelf: 'center', justifySelf: 'center' } as const;

interface KkImageViewerProps {
  items: readonly KkViewerItem[];
  index: number | null;
  labels: KkViewerLabels;
  title?: string;
  footer?: ReactNode;
  onIndexChange: (index: number) => void;
  onClose: () => void;
}

export const KkImageViewer: FC<KkImageViewerProps> = ({
  items,
  index,
  labels,
  title,
  footer,
  onIndexChange,
  onClose,
}) => (
  <KkViewer
    items={items}
    index={index}
    labels={labels}
    title={title}
    onIndexChange={onIndexChange}
    onClose={onClose}
  >
    <KkImageViewerSurface>
      <KkImageViewerHeader>
        <KkImageViewerTitle title={title} />
        <KkImageViewerActions>
          <KkViewer.Counter />
          <KkViewer.Close />
        </KkImageViewerActions>
      </KkImageViewerHeader>
      <KkViewer.Stage sx={{ gridArea: 'stage' }} />
      <KkImageViewerFooter>
        <KkViewer.Caption />
        {footer}
      </KkImageViewerFooter>
      <KkViewer.StepButton direction={-1} sx={{ gridArea: 'prev', ...STEP_PLACEMENT }} />
      <KkViewer.StepButton direction={1} sx={{ gridArea: 'next', ...STEP_PLACEMENT }} />
    </KkImageViewerSurface>
  </KkViewer>
);
