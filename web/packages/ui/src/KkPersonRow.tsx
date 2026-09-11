import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ElementType, FC, ReactNode } from 'react';
import { KkAvatar } from './KkAvatar';
import { KkIcon } from './KkIcon';
import type { KkSx } from './kk-sx';
import { resolvePersonRowAffiliation } from './person-row-affiliation';

const HAIRLINE = 1.5;
const NAME_SIZE = '0.90625rem';
const AFFILIATION_SIZE = '0.75rem';

const clampedLine = {
  minWidth: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const;

interface KkPersonRowProps {
  initials: string;
  name: string;
  accent?: string;
  meta?: string;
  emptyMeta?: string;
  trailing?: ReactNode;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  onClick?: () => void;
  sx?: KkSx;
}

export const KkPersonRow: FC<KkPersonRowProps> = ({
  initials,
  name,
  accent,
  meta,
  emptyMeta,
  trailing,
  component,
  to,
  params,
  onClick,
  sx,
}) => {
  const affiliation = resolvePersonRowAffiliation({ accent, meta, emptyMeta });
  const interactive = component !== undefined || onClick !== undefined;
  const rowComponent = component ?? (onClick === undefined ? 'div' : 'button');
  const routeProps = component === undefined ? {} : { to, params };
  const nativeProps = rowComponent === 'button' ? { type: 'button' as const } : {};
  const hasSecondLine = affiliation.present || trailing !== undefined;

  const accentPart =
    affiliation.accent === null ? null : (
      <Box component="span" sx={{ color: 'primary.main' }}>
        {affiliation.accent}
      </Box>
    );

  const metaPart =
    affiliation.meta === null ? null : (
      <Box component="span" sx={{ color: 'text.disabled' }}>
        {affiliation.meta}
      </Box>
    );

  const emptyPart =
    affiliation.empty === null ? null : (
      <Box component="span" sx={{ color: 'text.disabled', fontStyle: 'italic', fontWeight: 600 }}>
        {affiliation.empty}
      </Box>
    );

  const affiliationLine = affiliation.present ? (
    <Typography
      component="p"
      sx={{
        fontSize: AFFILIATION_SIZE,
        fontWeight: 700,
        lineHeight: 1.3,
        color: 'text.disabled',
        ...clampedLine,
      }}
    >
      {accentPart}
      {metaPart}
      {emptyPart}
    </Typography>
  ) : null;

  const inlineTrailing =
    trailing === undefined ? null : (
      <Box component="span" sx={{ display: { xs: 'inline-flex', desktop: 'none' }, flexShrink: 0 }}>
        {trailing}
      </Box>
    );

  const slotTrailing =
    trailing === undefined ? null : (
      <Box component="span" sx={{ display: { xs: 'none', desktop: 'inline-flex' }, flexShrink: 0 }}>
        {trailing}
      </Box>
    );

  const secondLine = hasSecondLine ? (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 0.875, minWidth: 0 }}>
      {inlineTrailing}
      {affiliationLine}
    </Stack>
  ) : null;

  const chevron = interactive ? (
    <Box
      component="span"
      data-kk-person-row-chevron
      sx={{ display: 'inline-flex', color: 'text.disabled', flexShrink: 0 }}
    >
      <KkIcon name="chevron" size="small" />
    </Box>
  ) : null;

  return (
    <Stack
      component={rowComponent}
      {...routeProps}
      {...nativeProps}
      onClick={onClick}
      direction="row"
      data-kk-person-row
      sx={[
        {
          width: '100%',
          minWidth: 0,
          alignItems: 'center',
          gap: 1.5,
          m: 0,
          px: 0,
          py: 1.375,
          appearance: 'none',
          backgroundColor: 'transparent',
          color: 'inherit',
          textAlign: 'left',
          textDecoration: 'none',
          borderWidth: 0,
          borderTopWidth: HAIRLINE,
          borderStyle: 'solid',
          borderColor: 'divider',
          cursor: interactive ? 'pointer' : 'default',
          '&:first-of-type': { borderTopWidth: 0 },
          '@media (hover: hover)': {
            '&:hover': {
              '& [data-kk-person-row-name]': { color: 'primary.main' },
              '& [data-kk-person-row-chevron]': { color: 'text.primary' },
            },
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <KkAvatar initials={initials} sx={{ flexShrink: 0 }} />
      <Stack sx={{ flexGrow: 1, minWidth: 0, gap: 0.375 }}>
        <Typography
          component="p"
          data-kk-person-row-name
          sx={{
            fontSize: NAME_SIZE,
            fontWeight: 800,
            lineHeight: 1.25,
            color: 'text.primary',
            ...clampedLine,
          }}
        >
          {name}
        </Typography>
        {secondLine}
      </Stack>
      {slotTrailing}
      {chevron}
    </Stack>
  );
};
