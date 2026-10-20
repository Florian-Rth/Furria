import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ElementType, FC, ReactNode } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { KkMeta } from '../../../KkMeta';
import { stepFigures, stepLabel } from '../../../KkStatePill/state-paint';
import type { KkSx } from '../../../kk-sx';
import { kkTokens } from '../../../tokens';

const TITLE_LINES = 2;

const titleLink = (theme: Theme): CSSObject => ({
  color: 'inherit',
  textDecoration: 'none',
  borderRadius: `${kkTokens.radius.bar}px`,
  ...focusRing(theme),
  '@media (hover: hover)': { '&:hover': redInk(theme) },
});

interface KkStateCardRootProps {
  eyebrow: string;
  title: string;
  meta: string;
  media?: ReactNode;
  badge?: ReactNode;
  due?: ReactNode;
  countdown?: ReactNode;
  cancelled?: boolean;
  dimmed?: boolean;
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  children?: ReactNode;
  sx?: KkSx;
}

export const KkStateCardRoot: FC<KkStateCardRootProps> = ({
  eyebrow,
  title,
  meta,
  media,
  badge,
  due,
  countdown,
  cancelled = false,
  dimmed = false,
  component,
  to,
  params,
  children,
  sx,
}) => {
  const linkProps = component === undefined ? {} : { component, to, params };
  const titleInk = cancelled || dimmed ? 'text.secondary' : 'text.primary';
  const titleStrike = cancelled ? 'line-through' : 'none';
  const steps =
    children === undefined || children === null ? null : (
      <Box
        role="group"
        sx={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: 'minmax(0, 1fr)',
          columnGap: 0.25,
          pt: 0.75,
          borderTopWidth: kkTokens.line.hair,
          borderTopStyle: 'solid',
          borderTopColor: 'divider',
        }}
      >
        {children}
      </Box>
    );

  return (
    <Stack
      component="article"
      data-kk-state-card
      sx={[
        {
          minWidth: 0,
          gap: 1.25,
          px: 1.5,
          pt: 1.5,
          pb: 1,
          bgcolor: 'background.paper',
          borderWidth: kkTokens.line.hair,
          borderStyle: 'solid',
          borderColor: 'divider',
          borderRadius: `${kkTokens.radius.base}px`,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'auto minmax(0, 1fr) auto',
          alignItems: 'start',
          columnGap: 1.25,
          minWidth: 0,
          opacity: dimmed ? kkTokens.opacity.dimmed : 1,
        }}
      >
        {media}
        <Stack sx={{ minWidth: 0, rowGap: 0.375 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1, minWidth: 0 }}>
            <Box
              component="span"
              sx={{ ...stepLabel, ...stepFigures, color: 'text.primary', flexShrink: 0 }}
            >
              {eyebrow}
            </Box>
            {badge}
          </Stack>
          <Typography
            {...linkProps}
            variant="body2"
            sx={[
              titleLink,
              {
                fontWeight: 800,
                lineHeight: 1.25,
                color: titleInk,
                textDecoration: titleStrike,
                minWidth: 0,
                display: '-webkit-box',
                WebkitLineClamp: TITLE_LINES,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              },
            ]}
          >
            {title}
          </Typography>
          <KkMeta sx={{ ...stepFigures, minWidth: 0 }}>{meta}</KkMeta>
          {due}
        </Stack>
        {countdown}
      </Box>
      {steps}
    </Stack>
  );
};
