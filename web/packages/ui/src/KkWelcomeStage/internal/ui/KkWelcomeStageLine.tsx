import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { useWelcomeRun } from '../logic/welcome-run-context';
import { plateRunOf } from '../welcome-paint';

export type KkWelcomeStageLineTone = 'lead' | 'plain' | 'quiet';

const VARIANT = { lead: 'h3', plain: 'h4', quiet: 'body1' } as const;
const INK = { lead: 'text.primary', plain: 'text.primary', quiet: 'text.secondary' } as const;
const MARK = '0.42em';

interface KkWelcomeStageLineProps extends PropsWithChildren {
  at: number;
  tone: KkWelcomeStageLineTone;
}

export const KkWelcomeStageLine: FC<KkWelcomeStageLineProps> = ({ at, tone, children }) => {
  const { leaving } = useWelcomeRun();

  return (
    <Typography
      component="p"
      variant={VARIANT[tone]}
      sx={{ minWidth: 0, color: INK[tone], fontWeight: 800, ...plateRunOf('ink', at, leaving) }}
    >
      <Stack direction="row" component="span" sx={{ alignItems: 'baseline', columnGap: 1 }}>
        <Box
          component="span"
          aria-hidden
          sx={{ flexShrink: 0, width: MARK, height: MARK, bgcolor: 'primary.main' }}
        />
        <Box component="span" sx={{ minWidth: 0 }}>
          {children}
        </Box>
      </Stack>
    </Typography>
  );
};
