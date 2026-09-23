import { KkEmptyState, KkScreen } from '@furria/ui';
import type { FC } from 'react';
import { PERSONS_ORIGIN } from '../manage-persons-labels';

const FALLBACK_TITLE = 'Person';
const NOT_FOUND_TITLE = 'GIBT ES NICHT (MEHR)';
const NOT_FOUND_DESCRIPTION = 'Dieser Eintrag existiert nicht oder wurde gelöscht.';

export const PersonEditorNotFound: FC = () => (
  <KkScreen kind="fullscreen" title={FALLBACK_TITLE} origin={PERSONS_ORIGIN}>
    <KkEmptyState title={NOT_FOUND_TITLE} description={NOT_FOUND_DESCRIPTION} />
  </KkScreen>
);
