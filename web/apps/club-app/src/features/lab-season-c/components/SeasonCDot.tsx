import { KkButton } from '@furria/ui/KkButton';
import { KkStatePill } from '@furria/ui/KkStatePill';
import type { FC } from 'react';
import type { SeasonCDot as SeasonCDotState } from '../hooks/use-season-c';
import { DOT_STATES } from '../season-c-layout';

interface SeasonCDotProps {
  dot: SeasonCDotState;
}

export const SeasonCDot: FC<SeasonCDotProps> = ({ dot }) => (
  <KkButton
    variant="text"
    ariaLabel={dot.label}
    loading={dot.pending}
    onClick={dot.toggle}
    sx={{ minWidth: 0, px: 1 }}
  >
    <KkStatePill state={DOT_STATES[dot.kind]} label={dot.text} sx={{ ml: 0 }} />
  </KkButton>
);
