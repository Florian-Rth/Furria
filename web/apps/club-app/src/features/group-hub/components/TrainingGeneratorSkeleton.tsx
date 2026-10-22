import { KkPanel } from '@furria/ui/KkPanel';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import { KkSkeletonRow } from '@furria/ui/KkSkeletonRow';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';

const LOADING_LABEL = 'Die Vorschau wird geladen';
const FORM_GAP = 2;
const FIELD_LINES = 3;
const PREVIEW_ROWS = 5;

export const TrainingGeneratorSkeleton: FC = () => (
  <AppSkeletonRegion label={LOADING_LABEL} gap={FORM_GAP}>
    <KkSkeletonBlock lines={FIELD_LINES} />
    <KkPanel variant="block">
      <KkSkeletonRow count={PREVIEW_ROWS} shape="select" />
    </KkPanel>
  </AppSkeletonRegion>
);
