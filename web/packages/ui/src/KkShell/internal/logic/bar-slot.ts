import type { CSSObject } from '@mui/material/styles';
import { kkTokens } from '../../../tokens';

const { tapTarget } = kkTokens;
const { barMark } = kkTokens.shell;

export const barSlot: CSSObject = {
  flexShrink: 0,
  width: tapTarget,
  height: tapTarget,
  minWidth: tapTarget,
  minHeight: tapTarget,
  padding: 0,
};

export const barMarkInset = `calc((${tapTarget} - ${barMark}) / 2)`;
