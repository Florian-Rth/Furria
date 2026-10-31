import type { CSSObject } from '@mui/material/styles';
import { kkTokens } from '../tokens';

export type TapAreaLayer = 'before' | 'after';

const GROWTH = `min(0px, calc((100% - ${kkTokens.tapTarget}) / 2))`;

export const tapArea = (layer: TapAreaLayer = 'after'): CSSObject => ({
  position: 'relative',
  [`&::${layer}`]: {
    content: '""',
    position: 'absolute',
    top: GROWTH,
    right: GROWTH,
    bottom: GROWTH,
    left: GROWTH,
  },
});
