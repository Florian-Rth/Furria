import { KkEmptyState, KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { OVERVIEW_ORIGIN } from '../app-sections';
import {
  SCREEN_NOT_FOUND_BAR_TITLE,
  SCREEN_NOT_FOUND_DESCRIPTION,
  SCREEN_NOT_FOUND_TITLE,
} from '../session-messages';

export const ScreenNotFound: FC = () => (
  <KkScreen kind="fullscreen" title={SCREEN_NOT_FOUND_BAR_TITLE} origin={OVERVIEW_ORIGIN}>
    <KkEmptyState title={SCREEN_NOT_FOUND_TITLE} description={SCREEN_NOT_FOUND_DESCRIPTION} />
  </KkScreen>
);
