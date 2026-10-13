import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ElementType, FC } from 'react';
import type { KkStatusLevel } from '../../../internal/status-paint';
import { BOARD_INK } from '../../../internal/status-paint';
import { kkTokens } from '../../../tokens';
import { boardLinkOf } from '../board-link';
import { boardFocusRing } from '../board-paint';

export interface KkFlapBoardReason {
  key: string;
  level: KkStatusLevel;
  text: string;
  to: string;
}

const TICK_WIDTH = 10;

const reasonLink = (theme: Theme): CSSObject => ({
  ...theme.typography.body2,
  display: 'inline-flex',
  alignItems: 'baseline',
  columnGap: 1,
  fontWeight: 700,
  color: BOARD_INK.ink,
  textDecoration: 'none',
  ...boardFocusRing,
  '@media (hover: hover)': {
    '&:hover': { textDecoration: 'underline', textUnderlineOffset: '3px' },
  },
});

interface KkFlapBoardReasonsProps {
  reasons: readonly KkFlapBoardReason[];
  component?: ElementType;
}

export const KkFlapBoardReasons: FC<KkFlapBoardReasonsProps> = ({ reasons, component }) => {
  const lines = reasons.map((reason) => {
    const link = boardLinkOf(component, reason.to);

    return (
      <Box component="li" key={reason.key} sx={{ minWidth: 0 }}>
        <Box component={link.component} {...link.props} sx={reasonLink}>
          <Box
            component="span"
            aria-hidden
            sx={{
              width: TICK_WIDTH,
              height: kkTokens.line.section,
              flexShrink: 0,
              alignSelf: 'center',
              backgroundColor: BOARD_INK[reason.level],
            }}
          />
          <Typography component="span" sx={{ typography: 'body2', fontWeight: 'inherit' }}>
            {reason.text}
          </Typography>
        </Box>
      </Box>
    );
  });

  return (
    <Stack
      component="ul"
      data-kk-flap-board-reasons
      sx={{ m: 0, p: 0, listStyle: 'none', rowGap: 0.5, minWidth: 0 }}
    >
      {lines}
    </Stack>
  );
};
