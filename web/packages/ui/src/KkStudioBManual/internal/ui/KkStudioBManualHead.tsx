import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { AnimatePresence, motion } from 'motion/react';
import type { FC } from 'react';
import { KkFlapCount } from '../../../KkFlapCount';
import { KkIconButton } from '../../../KkIconButton';

const TITLE_ENTER = { opacity: 0, y: 10 } as const;
const TITLE_REST = { opacity: 1, y: 0 } as const;
const TITLE_LEAVE = { opacity: 0, y: -10 } as const;
const TITLE_TURN = { duration: 0.28, ease: [0.2, 0.8, 0.3, 1] } as const;

const HEAD = {
  display: 'grid',
  gridTemplateColumns: 'auto minmax(0, 1fr) auto',
  alignItems: 'center',
  columnGap: 1.25,
  minWidth: 0,
} as const;

const TITLE = { display: 'grid', minWidth: 0 } as const;

const TITLE_LAYER = { gridArea: '1 / 1', minWidth: 0 } as const;

const NAME = {
  m: 0,
  typography: 'subtitle1',
  fontWeight: 800,
  lineHeight: 1.2,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
} as const;

const META = {
  typography: 'caption',
  color: 'text.secondary',
  fontVariantNumeric: 'tabular-nums',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
} as const;

export interface KkStudioBManualHeadMove {
  label: string;
  onSelect: () => void;
  disabled: boolean;
}

interface KkStudioBManualHeadProps {
  stepKey: string;
  number: string;
  name: string;
  meta: string;
  previous: KkStudioBManualHeadMove;
  next: KkStudioBManualHeadMove;
}

export const KkStudioBManualHead: FC<KkStudioBManualHeadProps> = ({
  stepKey,
  number,
  name,
  meta,
  previous,
  next,
}) => (
  <Box data-kk-studio-b-head sx={HEAD}>
    <KkFlapCount value={number} variant="h1" tone="red" />
    <Box sx={TITLE}>
      <AnimatePresence initial={false} mode="popLayout">
        <Box
          key={stepKey}
          component={motion.div}
          initial={TITLE_ENTER}
          animate={TITLE_REST}
          exit={TITLE_LEAVE}
          transition={TITLE_TURN}
          sx={TITLE_LAYER}
        >
          <Box component="h2" sx={NAME}>
            {name}
          </Box>
          <Box sx={META}>{meta}</Box>
        </Box>
      </AnimatePresence>
    </Box>
    <Stack direction="row" sx={{ gap: 0 }}>
      <KkIconButton
        icon="back"
        label={previous.label}
        disabled={previous.disabled}
        onClick={previous.onSelect}
      />
      <KkIconButton
        icon="chevron"
        label={next.label}
        disabled={next.disabled}
        onClick={next.onSelect}
      />
    </Stack>
  </Box>
);
