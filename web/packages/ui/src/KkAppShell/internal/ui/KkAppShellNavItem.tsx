import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ElementType, FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { KkChip } from '../../../KkChip';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import { useAppShellCurtain } from '../logic/app-shell-curtain-context';
import type { KkAppShellTextTransform } from './KkAppShellPageTitle';

const LABEL_SIZE = { xs: '1.4375rem', desktop: '1.25rem' };
const ROW_PADDING = { xs: 1, desktop: 0.75 };

interface KkAppShellNavItemProps {
  label: string;
  icon: KkIconName;
  active?: boolean;
  disabled?: boolean;
  hint?: string;
  transform?: KkAppShellTextTransform;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  onClick?: () => void;
}

export const KkAppShellNavItem: FC<KkAppShellNavItemProps> = ({
  label,
  icon,
  active = false,
  disabled = false,
  hint,
  transform = 'uppercase',
  component = 'button',
  to,
  params,
  onClick,
}) => {
  const curtain = useAppShellCurtain();
  const liveLabelColor = active ? 'text.primary' : 'text.secondary';
  const restingIconColor = disabled ? 'text.disabled' : 'text.secondary';
  const labelColor = disabled ? 'text.disabled' : liveLabelColor;
  const iconPaint = (theme: Theme): CSSObject =>
    active && !disabled
      ? { ...redInk(theme), flexShrink: 0 }
      : { color: restingIconColor, flexShrink: 0 };
  const rowComponent = disabled ? 'span' : component;
  const routeProps = disabled ? {} : { to, params };
  const hoverPaint = disabled
    ? {}
    : { '&:hover': { '& [data-kk-app-shell-nav-label]': { color: 'text.primary' } } };

  const hintChip =
    hint === undefined ? null : (
      <KkChip tone="neutral" size="small">
        {hint}
      </KkChip>
    );

  const activate = (): void => {
    curtain.close();
    onClick?.();
  };

  return (
    <Stack
      component="li"
      data-kk-app-shell-nav-item
      sx={{
        minWidth: 0,
        borderBottom: kkTokens.line.hair,
        borderColor: 'divider',
        '&:last-of-type': { borderBottom: 'none' },
      }}
    >
      <Stack
        component={rowComponent}
        {...routeProps}
        onClick={disabled ? undefined : activate}
        aria-current={active ? 'page' : undefined}
        direction="row"
        sx={(theme) => ({
          alignItems: 'center',
          gap: 1.5,
          width: '100%',
          minWidth: 0,
          textAlign: 'left',
          textDecoration: 'none',
          border: 'none',
          background: 'none',
          py: ROW_PADDING,
          px: 0,
          cursor: disabled ? 'default' : 'pointer',
          ...focusRing(theme),
          ...hoverPaint,
        })}
      >
        <KkIcon name={icon} size="small" sx={iconPaint} />
        <Typography
          data-kk-app-shell-nav-label
          sx={{
            fontFamily: kkTokens.font.display,
            fontSize: LABEL_SIZE,
            letterSpacing: kkTokens.type.tracking.display,
            lineHeight: 1.15,
            color: labelColor,
            textTransform: transform,
            minWidth: 0,
            flexGrow: 1,
          }}
        >
          {label}
        </Typography>
        {hintChip}
      </Stack>
    </Stack>
  );
};
