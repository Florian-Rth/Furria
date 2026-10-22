import { KkPanel } from '@furria/ui/KkPanel';
import { KkPanelSection } from '@furria/ui/KkPanelSection';
import { KkSinceRow } from '@furria/ui/KkSinceRow';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { formatIsoDay } from '@/lib/membership-labels';
import { toSectionLandingKey } from '../person-identity';
import type { PersonKeyHolding } from '../schemas';

const TITLE = 'Schlüssel';
const SINCE_LABEL = 'seit';
const KEYS_PATH = '/manage/keys';

interface PersonKeysPanelProps {
  personId: number;
  holdings: readonly PersonKeyHolding[];
  highlightedKey: string | null;
}

export const PersonKeysPanel: FC<PersonKeysPanelProps> = ({
  personId,
  holdings,
  highlightedKey,
}) => {
  const landingKey = toSectionLandingKey('keys', personId);
  const { has } = usePermissions();
  const linkProps = has(PERMISSION_KEYS.keyHoldingsManage)
    ? { component: Link, to: KEYS_PATH }
    : {};

  const rows = holdings.map((holding) => (
    <KkSinceRow
      key={`${holding.venueId}-${holding.sinceOn}`}
      icon="key"
      title={holding.name}
      sinceLabel={SINCE_LABEL}
      sinceValue={formatIsoDay(holding.sinceOn)}
      {...linkProps}
    />
  ));

  return (
    <KkPanelSection title={TITLE}>
      <KkPanel highlight={highlightedKey === landingKey} landing={landingKey}>
        {rows}
      </KkPanel>
    </KkPanelSection>
  );
};
