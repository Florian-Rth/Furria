import type { CSSObject } from '@mui/material/styles';
import { kkTokens } from '../tokens';

const UNDERLINE_OFFSET = '0.25em';

export const signifierCommitted: CSSObject = {
  textDecorationStyle: 'solid',
  textDecorationThickness: kkTokens.line.section,
};

export const labelSignifier: CSSObject = {
  textDecorationLine: 'underline',
  textDecorationStyle: 'dotted',
  textDecorationThickness: kkTokens.line.hair,
  textUnderlineOffset: UNDERLINE_OFFSET,
  '&:hover, &:focus-visible': signifierCommitted,
};

export const inertLabel: CSSObject = {
  '&.Mui-disabled': { textDecorationLine: 'none' },
};
