import { KkButton, KkEmptyState, KkScreen } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { KEYS_ORIGIN, MANAGE_KEYS_TITLE } from '../manage-keys-labels';

const NOT_FOUND_TITLE = 'DIESEN SCHLÜSSEL GIBT ES NICHT';
const NOT_FOUND_DESCRIPTION =
  'Dieser Ort oder diese Schlüsselübergabe steht nicht in der Übersicht.';
const BACK_LABEL = 'Zu den Schlüsseln';
const KEYS_PATH = '/manage/keys';

export const KeyEditorNotFound: FC = () => (
  <KkScreen kind="fullscreen" title={MANAGE_KEYS_TITLE} origin={KEYS_ORIGIN}>
    <KkEmptyState
      title={NOT_FOUND_TITLE}
      description={NOT_FOUND_DESCRIPTION}
      action={
        <KkButton variant="outlined" component={Link} to={KEYS_PATH}>
          {BACK_LABEL}
        </KkButton>
      }
    />
  </KkScreen>
);
