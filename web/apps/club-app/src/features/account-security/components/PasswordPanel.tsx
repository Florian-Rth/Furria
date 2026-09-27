import type { KkPanelAction } from '@furria/ui';
import { KkFieldRow, KkPanel, KkPanelSection } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { toLandingKey } from '@/features/write';
import {
  PASSWORD_EDIT_PATH,
  PASSWORD_EDIT_TITLE,
  SECURITY_LANDINGS,
} from '../account-security-labels';

const TITLE = 'Passwort';
const PASSWORD_LABEL = 'Passwort';
const HIDDEN_PASSWORD = '••••••••••••';
const EDIT_LABEL = 'Bearbeiten';

const EDIT_ACTION: KkPanelAction = {
  label: EDIT_LABEL,
  icon: 'edit',
  ariaLabel: PASSWORD_EDIT_TITLE,
  component: Link,
  to: PASSWORD_EDIT_PATH,
};

const LANDING_KEY = toLandingKey(SECURITY_LANDINGS.password.kind, SECURITY_LANDINGS.password.id);

interface PasswordPanelProps {
  highlightedKey: string | null;
}

export const PasswordPanel: FC<PasswordPanelProps> = ({ highlightedKey }) => {
  const isHighlighted = highlightedKey === LANDING_KEY;

  return (
    <KkPanelSection title={TITLE} action={EDIT_ACTION}>
      <KkPanel highlight={isHighlighted} landing={LANDING_KEY}>
        <KkFieldRow label={PASSWORD_LABEL} value={HIDDEN_PASSWORD} />
      </KkPanel>
    </KkPanelSection>
  );
};
