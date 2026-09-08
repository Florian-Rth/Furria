import { KkAppShell } from '@furria/ui';
import type { FC } from 'react';
import { AppPageHeader } from '@/features/session';
import { ProfileBody } from './ProfileBody';

const PROFILE_TITLE = 'Profil';

export const ProfilePage: FC = () => (
  <>
    <AppPageHeader>
      <KkAppShell.PageTitle>{PROFILE_TITLE}</KkAppShell.PageTitle>
    </AppPageHeader>
    <ProfileBody />
  </>
);
