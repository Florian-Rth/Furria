import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ElementType, FC } from 'react';
import { KkAvatar } from '../../../KkAvatar';
import { KkNote } from '../../../KkNote';
import { useAppShellCurtain } from '../logic/app-shell-curtain-context';

const AVATAR_SIZE = 34;

interface KkAppShellIdentityProps {
  initials: string;
  name: string;
  meta: string;
  label?: string;
  component?: ElementType;
  to?: string;
}

export const KkAppShellIdentity: FC<KkAppShellIdentityProps> = ({
  initials,
  name,
  meta,
  label,
  component = 'div',
  to,
}) => {
  const curtain = useAppShellCurtain();

  return (
    <Stack
      component={component}
      to={to}
      onClick={curtain.close}
      aria-label={label}
      direction="row"
      data-kk-app-shell-identity
      sx={{
        flex: 1,
        minWidth: 0,
        alignItems: 'center',
        gap: 1.375,
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <KkAvatar initials={initials} sx={{ width: AVATAR_SIZE, height: AVATAR_SIZE }} />
      <Stack sx={{ minWidth: 0, gap: 0.125 }}>
        <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
          {name}
        </Typography>
        <KkNote>{meta}</KkNote>
      </Stack>
    </Stack>
  );
};
