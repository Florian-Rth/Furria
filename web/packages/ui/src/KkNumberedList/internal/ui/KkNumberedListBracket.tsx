import Box from '@mui/material/Box';
import type { CSSObject } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { GUTTER_WIDTH } from './numbered-list-paint';

export type KkListBracket = 'single' | 'start' | 'middle' | 'end';

const STROKE = kkTokens.line.section;
const INSET = '0.375rem';
const TICK = '0.375rem';

const spans: Record<KkListBracket, CSSObject> = {
  single: { top: '50%', bottom: '50%' },
  start: { top: '50%', bottom: 0, borderTopWidth: STROKE },
  middle: { top: 0, bottom: 0 },
  end: { top: 0, bottom: '50%', borderBottomWidth: STROKE },
};

interface KkNumberedListBracketProps {
  bracket: KkListBracket | null;
  preview?: boolean;
}

export const KkNumberedListBracket: FC<KkNumberedListBracketProps> = ({
  bracket,
  preview = false,
}) => {
  const stroke =
    bracket === null ? null : (
      <Box
        component="span"
        data-kk-numbered-bracket={bracket}
        sx={{
          position: 'absolute',
          left: INSET,
          width: TICK,
          borderColor: preview ? 'text.secondary' : 'text.primary',
          borderStyle: preview ? 'dashed' : 'solid',
          borderWidth: 0,
          borderLeftWidth: STROKE,
          ...spans[bracket],
        }}
      />
    );

  return (
    <Box
      component="span"
      aria-hidden
      sx={{ position: 'relative', alignSelf: 'stretch', flexShrink: 0, width: GUTTER_WIDTH }}
    >
      {stroke}
    </Box>
  );
};
