import { KkHubRow } from '@furria/ui/KkHubRow';
import { KkPanel } from '@furria/ui/KkPanel';
import type { FC } from 'react';
import {
  IN_PERSON_ACT_LABEL,
  MAIL_ACT_LABELS,
} from '@/features/account-access/account-access-labels';

const SAMPLE_EMAIL = 'anna.becker@example.de';

export const PersonHelpAppPreview: FC = () => (
  <KkPanel>
    <KkHubRow label={MAIL_ACT_LABELS.invite} icon="mail" meta={SAMPLE_EMAIL} />
    <KkHubRow label={IN_PERSON_ACT_LABEL} icon="qr" />
  </KkPanel>
);
