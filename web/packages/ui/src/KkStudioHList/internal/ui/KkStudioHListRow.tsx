import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { goldInkOf } from '../../../internal/gold-ink';
import { kkTokens } from '../../../tokens';

export type KkStudioHListBadgeTone = 'ink' | 'quiet' | 'gold';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkStudioHListRowProps {
  lead: string;
  title: string;
  meta: string;
  badge: string | null;
  badgeTone: KkStudioHListBadgeTone;
  selected: boolean;
  label: string;
  onPress: () => void;
}

export const KkStudioHListRow: FC<KkStudioHListRowProps> = ({
  lead,
  title,
  meta,
  badge,
  badgeTone,
  selected,
  label,
  onPress,
}) => {
  const tag =
    badge === null ? null : (
      <Typography
        component="span"
        variant="caption"
        data-tone={badgeTone}
        sx={(theme) => ({
          flexShrink: 0,
          px: 0.75,
          borderRadius: `${kkTokens.radius.pill}px`,
          fontWeight: 900,
          lineHeight: 1.6,
          whiteSpace: 'nowrap',
          color: palette(theme).text.secondary,
          boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
          '&[data-tone="ink"]': {
            color: palette(theme).background.paper,
            backgroundColor: palette(theme).text.primary,
            boxShadow: 'none',
          },
          '&[data-tone="gold"]': {
            ...goldInkOf(theme),
            boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).warning.main}`,
          },
        })}
      >
        {badge}
      </Typography>
    );

  return (
    <ButtonBase
      role="listitem"
      aria-label={label}
      aria-current={selected ? 'true' : undefined}
      onClick={onPress}
      data-kk-studio-h-row
      data-selected={selected}
      sx={(theme) => ({
        flexShrink: 0,
        justifyContent: 'flex-start',
        gap: 1,
        minHeight: '3rem',
        px: 1,
        py: 0.5,
        textAlign: 'left',
        borderRadius: `${kkTokens.radius.base - 4}px`,
        transition: 'background-color 160ms ease-out, box-shadow 160ms ease-out',
        '&[data-selected="true"]': {
          backgroundColor: `color-mix(in srgb, ${palette(theme).text.primary} 6%, transparent)`,
          boxShadow: `inset ${kkTokens.line.page}px 0 0 ${palette(theme).primary.main}`,
        },
        ...focusRing(theme),
      })}
    >
      <Box
        sx={(theme) => ({
          flexShrink: 0,
          display: 'grid',
          placeItems: 'center',
          minWidth: '1.75rem',
          height: '1.75rem',
          px: 0.25,
          borderRadius: `${kkTokens.radius.bar + 1}px`,
          boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
        })}
      >
        <Typography
          component="span"
          variant="h4"
          sx={{ lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}
        >
          {lead}
        </Typography>
      </Box>
      <Stack sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          component="span"
          variant="subtitle2"
          sx={{
            lineHeight: 1.25,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {title}
        </Typography>
        <Typography
          component="span"
          variant="caption"
          sx={{
            lineHeight: 1.3,
            color: 'text.secondary',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {meta}
        </Typography>
      </Stack>
      {tag}
    </ButtonBase>
  );
};
