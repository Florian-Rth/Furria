import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ElementType, FC } from 'react';
import { KkChip } from '../../../KkChip';
import type { KkIconName } from '../../../KkIcon';
import { KkIcon } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import { useAppShellCurtain } from '../logic/app-shell-curtain-context';

const LABEL_SIZE = { xs: '1.4375rem', desktop: '1.25rem' };
const ROW_PADDING = { xs: 1, desktop: 0.75 };

interface KkAppShellNavItemProps {
  label: string;
  icon: KkIconName;
  active?: boolean;
  disabled?: boolean;
  hint?: string;
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
  component = 'button',
  to,
  params,
  onClick,
}) => {
  const curtain = useAppShellCurtain();
  const liveIconColor = active ? 'primary.main' : 'text.secondary';
  const liveLabelColor = active ? 'text.primary' : 'text.secondary';
  const iconColor = disabled ? 'text.disabled' : liveIconColor;
  const labelColor = disabled ? 'text.disabled' : liveLabelColor;
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
        onClick={activate}
        aria-current={active ? 'page' : undefined}
        aria-disabled={disabled || undefined}
        direction="row"
        sx={{
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
          ...hoverPaint,
        }}
      >
        <KkIcon name={icon} size="small" sx={{ color: iconColor, flexShrink: 0 }} />
        <Typography
          data-kk-app-shell-nav-label
          sx={{
            fontFamily: kkTokens.font.display,
            fontSize: LABEL_SIZE,
            letterSpacing: '0.03em',
            lineHeight: 1.15,
            color: labelColor,
            textTransform: 'uppercase',
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
