import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { motion } from 'motion/react';
import type { FC, PropsWithChildren } from 'react';
import { FanfareHeadlineShadow } from './FanfareHeadlineShadow';
import { HEADLINE_SELECTOR } from './fanfare-dom';
import { useFanfareHeadlineShadow } from './use-fanfare-headline-shadow';
import { useFanfareLift } from './use-fanfare-lift';

const HEADER_GAP = 1.25;
const HOLD = '--fanfare-hold';
const LIFT = '--fanfare-lift';
const VISIBLE = '--fanfare-headline';
const LEAVE = '--fanfare-leave';

const LEAVING_PART = `:not(${HEADLINE_SELECTOR}):not(:has(${HEADLINE_SELECTOR}))`;
const LEAVING = `&:has(${HEADLINE_SELECTOR}) > ${LEAVING_PART}, & :has(${HEADLINE_SELECTOR}) > ${LEAVING_PART}`;

const LEAVING_PAINT = { opacity: `var(${LEAVE})` };

export const FanfareLiftHeader: FC<PropsWithChildren> = ({ children }) => {
  const { wrapperRef, box } = useFanfareHeadlineShadow();
  const lift = useFanfareLift();

  const wrapperStyle = {
    minWidth: 0,
    [HOLD]: lift.hold,
    [LIFT]: lift.scale,
    [VISIBLE]: lift.visible,
    [LEAVE]: lift.leave,
  };

  return (
    <motion.div data-fanfare-header style={wrapperStyle}>
      <Box ref={wrapperRef} sx={{ position: 'relative', minWidth: 0 }}>
        <FanfareHeadlineShadow box={box} lift={lift} />
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
