import { KkScreen } from '@furria/ui/KkScreen';
import type { FC } from 'react';
import { GROUPS_ORIGIN } from '@/features/session/app-sections';
import { HubNotFound } from './HubNotFound';

const FALLBACK_TITLE = 'Gruppe';

export const GroupEditorNotFound: FC = () => (
  <KkScreen kind="fullscreen" title={FALLBACK_TITLE} origin={GROUPS_ORIGIN}>
    <HubNotFound />
  </KkScreen>
);
