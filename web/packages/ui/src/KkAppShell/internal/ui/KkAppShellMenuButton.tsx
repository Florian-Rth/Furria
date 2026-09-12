import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { KK_DARK_SCHEME_ATTRIBUTE } from '../../../theme';
import { kkTokens } from '../../../tokens';
import { useAppShellCurtain } from '../logic/app-shell-curtain-context';
import { KkAppShellMenuMark } from './KkAppShellMenuMark';

const FADE = 'linear-gradient(to top, var(--mui-palette-background-default) 46%, transparent)';
const OPEN_LABEL = 'Menü öffnen';

const darkSchemeAttribute = { [KK_DARK_SCHEME_ATTRIBUTE]: '' };

interface KkAppShellMenuButtonProps {
  label: string;
}

export const KkAppShellMenuButton: FC<KkAppShellMenuButtonProps> = ({ label }) => {
  const curtain = useAppShellCurtain();

  return (
    <Stack
      data-kk-app-shell-menu-dock
      sx={{
        display: { xs: 'flex', desktop: 'none' },
        position: 'fixed',
        insetInline: 0,
        bottom: 0,
        alignItems: 'center',
        pt: 3.25,
        pb: 1.75,
        backgroundImage: FADE,
        pointerEvents: 'none',
        zIndex: 10,
      }}
    >
      <Stack
        component="button"
        type="button"
        {...darkSchemeAttribute}
        aria-label={OPEN_LABEL}
        aria-expanded={curtain.isOpen}
        onClick={curtain.open}
        direction="row"
        data-kk-app-shell-menu-button
        sx={(theme) => ({
          pointerEvents: 'auto',
          alignItems: 'center',
          gap: 1.5,
          bgcolor: 'background.paper',
          color: 'text.primary',
          border: kkTokens.line.hair,
          borderStyle: 'solid',
          borderColor: 'divider',
          borderRadius: `${kkTokens.radius.action}px`,
          boxShadow: kkTokens.shadow.floating,
          cursor: 'pointer',
          pl: 2.125,
          pr: 2.5,
          py: 1.625,
          ...focusRing(theme),
        })}
      >
        <KkAppShellMenuMark />
        <Typography
          sx={{
            fontFamily: kkTokens.font.display,
            fontSize: '0.9375rem',
            letterSpacing: '0.09em',
            lineHeight: 1,
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </Typography>
      </Stack>
    </Stack>
  );
};
