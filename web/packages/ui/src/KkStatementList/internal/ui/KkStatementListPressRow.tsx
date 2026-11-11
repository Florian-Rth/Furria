import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { inkWashSurface } from '../../../internal/ink-wash';
import { redInk } from '../../../internal/red-ink';
import { stepFigures } from '../../../KkStatePill/state-paint';
import { kkTokens } from '../../../tokens';

const LEAD_WIDTH = '1.75rem';

const pressPaint =
  (selected: boolean) =>
  (theme: Theme): CSSObject => ({
    flex: 1,
    minWidth: 0,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    gap: 1,
    py: 1.25,
    pl: 0.5,
    pr: 1,
    textAlign: 'left',
    borderRadius: `${kkTokens.radius.base}px`,
    ...(selected ? inkWashSurface(theme, '6%', '10%') : {}),
    ...focusRing(theme),
    '@media (hover: hover)': {
      '&:hover [data-kk-statement-press-text]': redInk(theme),
    },
  });

interface KkStatementListPressRowProps extends PropsWithChildren {
  lead: string;
  meta: string;
  selected: boolean;
  onPress: () => void;
}

export const KkStatementListPressRow: FC<KkStatementListPressRowProps> = ({
  lead,
  meta,
  selected,
  onPress,
  children,
}) => (
  <ButtonBase
    aria-current={selected ? 'true' : undefined}
    onClick={onPress}
    sx={pressPaint(selected)}
  >
    <Box
      component="span"
      aria-hidden
      sx={{
        ...stepFigures,
        width: LEAD_WIDTH,
        flexShrink: 0,
        typography: 'subtitle2',
        fontWeight: 800,
        lineHeight: 1.35,
        color: 'text.secondary',
        textAlign: 'right',
      }}
    >
      {lead}
    </Box>
    <Stack component="span" sx={{ flex: 1, minWidth: 0, gap: 0.25 }}>
      <Typography
        component="span"
        variant="body2"
        data-kk-statement-press-text
        sx={{ fontWeight: 700, lineHeight: 1.35, overflowWrap: 'anywhere' }}
      >
        {children}
      </Typography>
      <Typography
        component="span"
        variant="caption"
        sx={{ ...stepFigures, color: 'text.secondary', lineHeight: 1.3 }}
      >
        {meta}
      </Typography>
    </Stack>
  </ButtonBase>
);
