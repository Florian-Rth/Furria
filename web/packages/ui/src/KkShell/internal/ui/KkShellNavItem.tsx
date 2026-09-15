import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import type { KkShellDestination } from '../../shell-destination';
import { useKkShell } from '../logic/shell-context';

interface KkShellNavItemProps {
  destination: KkShellDestination;
  active: boolean;
}

export const KkShellNavItem: FC<KkShellNavItemProps> = ({ destination, active }) => {
  const { link } = useKkShell();
  const routeProps = { to: destination.to };
  const iconName = active ? destination.activeIcon : destination.icon;
  const labelColor = active ? 'text.primary' : 'text.secondary';

  const iconPaint = (theme: Theme): CSSObject =>
    active ? { ...redInk(theme), flexShrink: 0 } : { color: 'text.secondary', flexShrink: 0 };

  return (
    <Stack
      component={link}
      {...routeProps}
      aria-current={active ? 'page' : undefined}
      data-kk-shell-nav-item
      sx={(theme) => ({
        flex: 1,
        minWidth: 0,
        minHeight: kkTokens.tapTarget,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.25,
        color: 'inherit',
        textDecoration: 'none',
        cursor: 'pointer',
        borderRadius: `${kkTokens.radius.base}px`,
        ...focusRing(theme),
      })}
    >
      <KkIcon name={iconName} size="small" sx={iconPaint} />
      <Typography
        data-kk-shell-nav-label
        sx={{
          fontSize: kkTokens.type.eyebrowSmall,
          fontWeight: kkTokens.eyebrow.fontWeight,
          letterSpacing: kkTokens.type.tracking.label,
          lineHeight: 1,
          textTransform: 'uppercase',
          color: labelColor,
          minWidth: 0,
        }}
      >
        {destination.label}
      </Typography>
    </Stack>
  );
};
