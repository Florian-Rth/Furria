import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ElementType, FC, ReactNode } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { KkEyebrow } from '../../../KkEyebrow';
import { KkMeta } from '../../../KkMeta';
import { stepFigures } from '../../../KkStatePill/state-paint';
import { kkTokens } from '../../../tokens';
import { stateGridLine } from '../state-grid-paint';

const rowPaint =
  (selected: boolean, dimmed: boolean) =>
  (theme: Theme): CSSObject => ({
    ...stateGridLine,
    alignItems: 'center',
    px: 1.5,
    py: 1,
    borderBottomWidth: kkTokens.line.hair,
    borderBottomStyle: 'solid',
    borderBottomColor: 'divider',
    transition: 'background-color 160ms ease-out',
    backgroundColor: selected ? 'action.hover' : 'transparent',
    '& > [data-kk-state-grid-lead]': { opacity: dimmed ? kkTokens.opacity.dimmed : 1 },
    '@media (hover: hover)': {
      '&:hover': { backgroundColor: 'action.hover' },
      '&:hover [data-kk-state-grid-title]': redInk(theme),
    },
  });

const titleLink = (theme: Theme): CSSObject => ({
  color: 'inherit',
  textDecoration: 'none',
  borderRadius: `${kkTokens.radius.bar}px`,
  ...focusRing(theme),
});

interface KkStateGridRowProps {
  day: string;
  dayLabel: string;
  title: string;
  meta: string;
  media?: ReactNode;
  badge?: ReactNode;
  due?: ReactNode;
  countdown?: ReactNode;
  cancelled?: boolean;
  dimmed?: boolean;
  selected?: boolean;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  children?: ReactNode;
}

export const KkStateGridRow: FC<KkStateGridRowProps> = ({
  day,
  dayLabel,
  title,
  meta,
  media,
  badge,
  due,
  countdown,
  cancelled = false,
  dimmed = false,
  selected = false,
  component,
  to,
  params,
  children,
}) => {
  const linkProps = component === undefined ? {} : { component, to, params };
  const titleInk = cancelled || dimmed ? 'text.secondary' : 'text.primary';
  const titleStrike = cancelled ? 'line-through' : 'none';

  return (
    <Box role="row" data-kk-state-grid-row sx={rowPaint(selected, dimmed)}>
      <Stack role="cell" data-kk-state-grid-lead sx={{ minWidth: 0, rowGap: 0.25 }}>
        <Typography
          component="span"
          variant="h4"
          sx={{ ...stepFigures, lineHeight: 1, letterSpacing: kkTokens.type.tracking.display }}
        >
          {day}
        </Typography>
        <KkEyebrow tone="muted" sx={{ lineHeight: 1, whiteSpace: 'nowrap' }}>
          {dayLabel}
        </KkEyebrow>
      </Stack>
      <Stack
        role="cell"
        direction="row"
        data-kk-state-grid-lead
        sx={{ alignItems: 'center', gap: 1.25, minWidth: 0 }}
      >
        {media}
        <Stack sx={{ minWidth: 0, rowGap: 0.375 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Typography
              {...linkProps}
              variant="body2"
              data-kk-state-grid-title
              sx={[
                titleLink,
                {
                  fontWeight: 800,
                  lineHeight: 1.25,
                  color: titleInk,
                  textDecoration: titleStrike,
                  transition: 'color 160ms ease-out',
                  minWidth: 0,
                },
              ]}
            >
              {title}
            </Typography>
            {badge}
          </Stack>
          <KkMeta sx={{ ...stepFigures, minWidth: 0 }}>{meta}</KkMeta>
          {due}
        </Stack>
      </Stack>
      <Stack role="cell" data-kk-state-grid-lead sx={{ alignItems: 'flex-end', minWidth: 0 }}>
        {countdown}
      </Stack>
      {children}
    </Box>
  );
};
