import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { motion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import { TuschHeadlineShadow } from './TuschHeadlineShadow';
import { HEADLINE_SELECTOR } from './tusch-dom';
import { useTuschHeadlineShadow } from './use-tusch-headline-shadow';
import { useTuschLift } from './use-tusch-lift';

const HEADER_GAP = 1.25;
const HOLD = '--tusch-hold';
const LIFT = '--tusch-lift';
const VISIBLE = '--tusch-headline';
const LEAVE = '--tusch-leave';

const LEAVING_PART = `:not(${HEADLINE_SELECTOR}):not(:has(${HEADLINE_SELECTOR}))`;
const LEAVING = `&:has(${HEADLINE_SELECTOR}) > ${LEAVING_PART}, & :has(${HEADLINE_SELECTOR}) > ${LEAVING_PART}`;

const LEAVING_PAINT = { opacity: `var(${LEAVE})` };

export const TuschLiftHeader: FC<PropsWithChildren> = ({ children }) => {
  const { wrapperRef, box } = useTuschHeadlineShadow();
  const lift = useTuschLift();

  const wrapperStyle = {
    minWidth: 0,
    [HOLD]: lift.hold,
    [LIFT]: lift.scale,
    [VISIBLE]: lift.visible,
    [LEAVE]: lift.leave,
  };

  return (
    <motion.div data-tusch-header style={wrapperStyle}>
      <Box ref={wrapperRef} sx={{ position: 'relative', minWidth: 0 }}>
        <TuschHeadlineShadow box={box} lift={lift} />
        <Stack
          sx={{
            minWidth: 0,
            gap: HEADER_GAP,
            pointerEvents: 'none',
            [`& ${HEADLINE_SELECTOR}`]: {
              position: 'relative',
              transform: `translateY(calc(var(${HOLD}) * 1px)) scale(var(${LIFT}))`,
              transformOrigin: 'left center',
              opacity: `var(${VISIBLE})`,
              willChange: 'transform',
            },
            [LEAVING]: LEAVING_PAINT,
            [`&:not(:has(${HEADLINE_SELECTOR}))`]: LEAVING_PAINT,
          }}
        >
          {children}
        </Stack>
      </Box>
    </motion.div>
  );
};
