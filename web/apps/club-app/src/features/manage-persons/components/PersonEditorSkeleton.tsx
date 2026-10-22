import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelStack } from '@furria/ui/KkPanelStack';
import { KkScreen } from '@furria/ui/KkScreen';
import { KkSkeletonBlock } from '@furria/ui/KkSkeletonBlock';
import type { FC } from 'react';
import { AppSkeletonRegion } from '@/features/session/components/AppSkeletonRegion';
import { PERSONS_ORIGIN } from '../manage-persons-labels';

const LOADING_LABEL = 'Wird geladen';
const SKELETON_LINES = 4;

interface PersonEditorSkeletonProps {
  title: string;
}

export const PersonEditorSkeleton: FC<PersonEditorSkeletonProps> = ({ title }) => (
  <KkScreen kind="fullscreen" title={title} origin={PERSONS_ORIGIN}>
    <AppSkeletonRegion label={LOADING_LABEL}>
      <KkPanelStack>
        <KkPanel variant="block">
          <KkSkeletonBlock lines={SKELETON_LINES} />
        </KkPanel>
      </KkPanelStack>
    </AppSkeletonRegion>
  </KkScreen>
);
