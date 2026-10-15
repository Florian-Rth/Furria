import Stack from '@mui/material/Stack';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { KkAvatar } from '../../../KkAvatar/KkAvatar';
import type { KkShellProfile } from '../../shell-profile';
import { barSlot } from '../logic/bar-slot';
import { useKkShell } from '../logic/shell-context';

interface KkShellBarProfileProps {
  profile: KkShellProfile;
}

export const KkShellBarProfile: FC<KkShellBarProfileProps> = ({ profile }) => {
  const { link, path } = useKkShell();
  const current = path === profile.to ? 'page' : undefined;

  return (
    <Stack
      component={link}
      to={profile.to}
      aria-label={profile.label}
      aria-current={current}
      data-kk-shell-bar-profile
      sx={[
        barSlot,
        {
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          textDecoration: 'none',
        },
        focusRing,
      ]}
    >
      <KkAvatar
        initials={profile.initials}
        image={profile.image}
        size="bar"
        honours={profile.honours}
      />
    </Stack>
  );
};
