import { KkHubRow } from '@furria/ui/KkHubRow';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { usePermissions } from '@/features/session/hooks/use-permissions';
import { PERMISSION_KEYS } from '@/lib/api/schemas';
import { OPEN_PERSON_LABEL } from '../intake-labels';
import { toResultingPersonPath } from '../intake-rules';

interface IntakePersonRowProps {
  personId: number;
}

export const IntakePersonRow: FC<IntakePersonRowProps> = ({ personId }) => {
  const { has } = usePermissions();
  const to = toResultingPersonPath(personId, has(PERMISSION_KEYS.personsManage));

  return <KkHubRow label={OPEN_PERSON_LABEL} icon="person" component={Link} to={to} />;
};
