import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import type { FC } from 'react';
import { kkTokens } from '../../../tokens';
import { typePixelsOf } from '../../type-pixels';
import { placeTransformOf } from '../honour-geometry';
import { sashInkPaint } from '../honour-paint';
import type { SashText } from '../honour-sash';

const NAME_FACE = [
  {
    typography: 'caption',
    fontFamily: kkTokens.font.display,
    fontWeight: kkTokens.font.displayWeight,
    letterSpacing: kkTokens.type.tracking.display,
  },
  sashInkPaint,
];

interface KkHonourSashNameProps {
  name: string;
  place: SashText;
}

export const KkHonourSashName: FC<KkHonourSashNameProps> = ({ name, place }) => {
  const theme = useTheme();
  const scale = place.size / typePixelsOf(theme.typography.caption.fontSize);
  const transform = placeTransformOf(place.x, place.baseline, scale);

  return (
    <Box component="text" x={0} y={0} transform={transform} sx={NAME_FACE}>
      {name}
    </Box>
  );
};
