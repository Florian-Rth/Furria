import Box from '@mui/material/Box';
import { keyframes } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkSx } from '../../../kk-sx';
import { useBoxFit } from '../logic/use-box-fit';
import { useWelcomeRun } from '../logic/welcome-run-context';
import { goldHalftoneOf, plateRunOf, REDUCED_MOTION } from '../welcome-paint';

const FIT = { least: 0.3, most: 4 };
const TILT_HEADROOM = 1.15;
const TILT = 'rotate(-6deg)';
const BLEED = '112%';
const REEL_EASE = 'cubic-bezier(0.5, 0, 0.08, 1)';
const CELL_EM = 1.2;

const reel = keyframes`
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(var(--kk-welcome-reel-end));
  }
`;

interface KkWelcomeStageYearProps {
  years: readonly number[];
  at: number;
  rollMs: number;
  sx?: KkSx;
}

export const KkWelcomeStageYear: FC<KkWelcomeStageYearProps> = ({ years, at, rollMs, sx }) => {
  const { leaving } = useWelcomeRun();
  const fit = useBoxFit(FIT, TILT_HEADROOM);
  const reelEnd = `-${(years.length - 1) * CELL_EM}em`;
  const cells = years.map((year) => (
    <Box key={year} component="span" sx={[{ display: 'block' }, goldHalftoneOf]}>
      {year}
    </Box>
  ));

  return (
    <Box
      ref={fit.room}
      sx={[
        {
          position: 'relative',
          flex: 1,
          minHeight: 0,
          width: BLEED,
          ...plateRunOf('gold', at, leaving),
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box
        ref={fit.face}
        sx={{ position: 'absolute', top: 0, left: 0, transformOrigin: 'left top' }}
      >
        <Typography
          component="div"
          variant="poster"
          sx={{
            height: `${CELL_EM}em`,
            lineHeight: CELL_EM,
            clipPath: 'inset(0)',
            transform: TILT,
            transformOrigin: 'left center',
          }}
        >
          <Box
            sx={{
              '--kk-welcome-reel-end': reelEnd,
              animation: `${reel} ${rollMs}ms ${REEL_EASE} ${at}ms both`,
              [REDUCED_MOTION]: { animation: 'none', transform: `translateY(${reelEnd})` },
            }}
          >
            {cells}
          </Box>
        </Typography>
      </Box>
    </Box>
  );
};
