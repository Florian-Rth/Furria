import { KkButton, KkEmptyState } from '@furria/ui';
import { Link } from '@tanstack/react-router';
import type { FC } from 'react';
import { PROFILE_PATH } from '../app-sections';

const STATE_TITLE = 'NICHT IM VEREIN AKTIV';
const STATE_DESCRIPTION =
  'Du hast gerade keine Mitgliedschaft, keine Gruppe und keine Rolle im Verein. Dein Account und dein Profil bleiben dir erhalten – sobald du wieder dabei bist, ist hier alles wie gewohnt.';
const PROFILE_LABEL = 'Zu deinem Profil';

export const NotAffiliatedState: FC = () => {
  const profileLink = (
    <KkButton variant="outlined" component={Link} to={PROFILE_PATH}>
      {PROFILE_LABEL}
    </KkButton>
  );

  return <KkEmptyState title={STATE_TITLE} description={STATE_DESCRIPTION} action={profileLink} />;
};
