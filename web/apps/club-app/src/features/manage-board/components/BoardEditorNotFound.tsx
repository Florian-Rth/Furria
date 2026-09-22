import { KkEmptyState, KkPanel, KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { BOARD_ORIGIN } from '../manage-board-labels';

const FALLBACK_TITLE = 'Vorstand';
const TITLE = 'DIESE VORSTANDSFUNKTION GIBT ES NICHT';
const DESCRIPTION = 'Vielleicht wurde sie umbenannt. Wähl eine andere aus dem Vorstand.';

export const BoardEditorNotFound: FC = () => (
  <KkScreen kind="fullscreen" title={FALLBACK_TITLE} origin={BOARD_ORIGIN}>
    <KkPanel variant="block">
      <KkEmptyState title={TITLE} description={DESCRIPTION} />
    </KkPanel>
  </KkScreen>
);
