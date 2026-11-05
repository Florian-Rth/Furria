import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { motion } from 'motion/react';
import type { FC, ReactNode } from 'react';
import { KkAvatar } from '../../../KkAvatar/KkAvatar';
import { stepFigures } from '../../../KkStatePill/state-paint';
import { kkTokens } from '../../../tokens';

const shown = { opacity: 1, height: 'auto' };
const hidden = { opacity: 0, height: 0 };
const fold = { duration: 0.22, ease: 'easeOut' } as const;

interface KkTabLedgerPersonProps {
  initials: string;
  name: string;
  count: string;
  day?: string;
  own?: boolean;
  action?: ReactNode;
}

export const KkTabLedgerPerson: FC<KkTabLedgerPersonProps> = ({
  initials,
  name,
  count,
  day,
  own = false,
  action = null,
}) => {
  const dayMark =
    day === undefined ? null : (
      <Box
        component="span"
        sx={{
          ...stepFigures,
          flexShrink: 0,
          width: '3.25rem',
          textAlign: 'right',
          typography: 'caption',
          fontWeight: 700,
          lineHeight: 1.25,
          color: 'text.secondary',
          whiteSpace: 'nowrap',
        }}
      >
        {day}
      </Box>
    );

  return (
    <Box
      component={motion.li}
      initial={hidden}
      animate={shown}
      exit={hidden}
      transition={fold}
      data-kk-tab-ledger-person
      sx={{
        minWidth: 0,
        borderTopWidth: kkTokens.line.hair,
        borderTopStyle: 'solid',
        borderTopColor: 'divider',
        '&:first-of-type': { borderTopWidth: 0 },
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', gap: 1.25, px: 1.5, py: 0.625, minWidth: 0 }}
      >
        <KkAvatar initials={initials} size="small" />
        <Box
          component="span"
          sx={{
            flex: 1,
            minWidth: 0,
            typography: 'body2',
            fontWeight: own ? 800 : 600,
            lineHeight: 1.25,
            color: 'text.primary',
            overflowWrap: 'anywhere',
          }}
        >
          {name}
        </Box>
        <Box
          component="span"
          sx={{
            ...stepFigures,
            flexShrink: 0,
            typography: 'body2',
            fontWeight: 800,
            lineHeight: 1.25,
            color: 'text.primary',
            whiteSpace: 'nowrap',
          }}
        >
          {count}
        </Box>
        {dayMark}
        {action}
      </Stack>
    </Box>
  );
};
