import { KkFieldRow } from '@furria/ui/KkFieldRow';
import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import type { KkPanelAction } from '@furria/ui/panel-action';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write/landing-target';
import {
  LOGIN_EMAIL_EDIT_PATH,
  LOGIN_EMAIL_EDIT_TITLE,
  SECURITY_LANDINGS,
} from '../account-security-labels';

const TITLE = 'Anmelde-E-Mail';
const DESCRIPTION =
  'Mit dieser Adresse meldest du dich an. Hierhin schicken wir auch jeden Hinweis zu deinem Account.';
const EMAIL_LABEL = 'E-Mail';
const EDIT_LABEL = 'Bearbeiten';

const EDIT_ACTION: KkPanelAction = {
  label: EDIT_LABEL,
  icon: 'edit',
  ariaLabel: LOGIN_EMAIL_EDIT_TITLE,
  component: Link,
  to: LOGIN_EMAIL_EDIT_PATH,
};

const LANDING_KEY = toLandingKey(
  SECURITY_LANDINGS.loginEmail.kind,
  SECURITY_LANDINGS.loginEmail.id,
);

interface LoginEmailPanelProps {
  loginEmail: string;
  highlightedKey: string | null;
}

export const LoginEmailPanel: FC<LoginEmailPanelProps> = ({ loginEmail, highlightedKey }) => {
  const isHighlighted = highlightedKey === LANDING_KEY;

  return (
    <KkPanelSection title={TITLE} action={EDIT_ACTION} description={DESCRIPTION}>
      <KkPanel highlight={isHighlighted} landing={LANDING_KEY}>
        <KkFieldRow label={EMAIL_LABEL} value={loginEmail} />
      </KkPanel>
    </KkPanelSection>
  );
};
