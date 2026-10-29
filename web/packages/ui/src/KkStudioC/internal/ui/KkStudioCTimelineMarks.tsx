import Box from '@mui/material/Box';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import type { KkStudioCMark } from '../../studio-c-types';

const MARK = '0.5rem';

const markPaint = (theme: Theme): CSSObject => ({
  position: 'absolute',
  top: '50%',
  width: MARK,
  height: MARK,
  transform: 'translate(-50%, -50%) rotate(45deg)',
  borderRadius: '1px',
  backgroundColor: (theme.vars ?? theme).palette.background.paper,
  borderWidth: kkTokens.line.section,
  borderStyle: 'solid',
  borderColor: (theme.vars ?? theme).palette.text.primary,
  pointerEvents: 'none',
});

interface KkStudioCTimelineMarksProps {
  marks: readonly KkStudioCMark[];
}

export const KkStudioCTimelineMarks: FC<KkStudioCTimelineMarksProps> = ({ marks }) => {
  const diamonds = marks.map((mark) => {
    const place = { left: mark.x };

    return <Box key={mark.key} aria-hidden data-kk-studio-c-mark style={place} sx={markPaint} />;
  });

  return <>{diamonds}</>;
};
