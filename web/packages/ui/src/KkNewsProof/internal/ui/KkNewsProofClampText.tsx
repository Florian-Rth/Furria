import Box from '@mui/material/Box';
import type { TypographyProps } from '@mui/material/Typography';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import type { KkSx } from '../../../kk-sx';
import { useClampCut } from '../logic/use-clamp-cut';
import { KkNewsProofCutMark } from './KkNewsProofCutMark';

interface KkNewsProofClampTextProps {
  text: string | null;
  placeholder: string;
  lines: number;
  variant: TypographyProps['variant'];
  sx?: KkSx;
}

const MUTED = { color: 'text.disabled' };
const UNMUTED = {};

export const KkNewsProofClampText: FC<KkNewsProofClampTextProps> = ({
  text,
  placeholder,
  lines,
  variant,
  sx,
}) => {
  const shown = text ?? placeholder;
  const clamp = useClampCut(shown, lines);
  const cutMark = clamp.cut ? <KkNewsProofCutMark /> : null;
  const tone = text === null ? MUTED : UNMUTED;

  return (
    <Box sx={{ position: 'relative', minWidth: 0 }}>
      <Typography
        ref={clamp.ref}
        variant={variant}
        sx={[
          {
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: lines,
            overflow: 'hidden',
            textWrap: 'pretty',
          },
          ...(Array.isArray(sx) ? sx : [sx]),
          tone,
        ]}
      >
        {shown}
      </Typography>
      {cutMark}
    </Box>
  );
};
