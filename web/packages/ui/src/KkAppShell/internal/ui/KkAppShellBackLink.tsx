import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ElementType, FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { KkIcon } from '../../../KkIcon';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

interface KkAppShellBackLinkProps {
  label: string;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  sx?: KkSx;
}

export const KkAppShellBackLink: FC<KkAppShellBackLinkProps> = ({
  label,
  component,
  to,
  params,
  sx,
}) => {
  const linkComponent = component ?? 'button';
  const routeProps = component === undefined ? {} : { to, params };
  const nativeProps = linkComponent === 'button' ? { type: 'button' as const } : {};

  return (
    <Stack
      component={linkComponent}
      {...routeProps}
      {...nativeProps}
      direction="row"
      data-kk-app-shell-back-link
      sx={[
        (theme) => ({
          position: 'relative',
          alignSelf: 'flex-start',
          alignItems: 'center',
          gap: 0.5,
          m: 0,
          p: 0,
          '&::after': {
            content: '""',
            position: 'absolute',
            left: 0,
            right: 0,
            top: '50%',
            height: kkTokens.tapTarget,
            transform: 'translateY(-50%)',
          },
          appearance: 'none',
          border: 'none',
          backgroundColor: 'transparent',
          color: 'text.secondary',
          cursor: 'pointer',
          textDecoration: 'none',
          ...focusRing(theme),
          '@media (hover: hover)': {
            '&:hover': { color: 'text.primary' },
          },
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <KkIcon name="back" size="small" />
      <Typography
        component="span"
        sx={{
          fontFamily: kkTokens.font.body,
          fontSize: kkTokens.type.chip,
          fontWeight: 700,
          letterSpacing: kkTokens.type.tracking.label,
          lineHeight: 1,
          textTransform: 'uppercase',
          color: 'inherit',
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
};
