import { KkButton } from '@furria/ui/KkButton';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import {
  toInPersonHref,
  toInviteHref,
  toPersonEditHref,
} from '@/features/account-access/account-access-labels';
import type { AppAct } from '../person-identity';

const ACT_LABELS: Record<AppAct, string> = {
  birthDate: 'Geburtsdatum eintragen',
  invite: 'Einladen',
  reinvite: 'Erneut einladen',
  inPerson: 'Vor Ort zeigen',
  unlock: 'Entsperren',
};

const ACT_HREFS: Record<AppAct, ((personId: number) => string) | null> = {
  birthDate: toPersonEditHref,
  invite: toInviteHref,
  reinvite: toInviteHref,
  inPerson: toInPersonHref,
  unlock: null,
};

interface PersonAppActButtonProps {
  act: AppAct;
  personId: number;
  onUnlock: () => void;
}

export const PersonAppActButton: FC<PersonAppActButtonProps> = ({ act, personId, onUnlock }) => {
  const toHref = ACT_HREFS[act];
  const label = ACT_LABELS[act];

  if (toHref === null) {
    return (
      <KkButton size="small" variant="outlined" onClick={onUnlock}>
        {label}
      </KkButton>
    );
  }

  return (
    <KkButton size="small" component={Link} to={toHref(personId)}>
      {label}
    </KkButton>
  );
};
