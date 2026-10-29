import { keyframes } from '@mui/material/styles';
import type { KkStudioFTurnDirection } from '../../studio-f-types';

export const STUDIO_F_EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';

const slideFrom = (shift: string) => keyframes`
  from { opacity: 0; transform: translateX(${shift}); }
  to { opacity: 1; transform: translateX(0); }
`;

const FORWARD_TEXT = slideFrom('1.25rem');
const BACK_TEXT = slideFrom('-1.25rem');

export const textArrivalOf = (direction: KkStudioFTurnDirection): string =>
  `${direction === 'forward' ? FORWARD_TEXT : BACK_TEXT} 260ms ${STUDIO_F_EASE} both`;
