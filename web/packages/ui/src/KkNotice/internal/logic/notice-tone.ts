import { alpha } from '@mui/material/styles';
import type { KkScheme } from '../../../internal/scheme-paint';
import { schemeEdge, schemeInk } from '../../../internal/scheme-paint';
import type { KkIconName } from '../../../KkIcon';
import { kkTokens } from '../../../tokens';
import type { KkNoticeTone } from '../../notice-declaration';

const { hairline } = kkTokens.shell.notice;

const toneIcons: Record<KkNoticeTone, KkIconName> = {
  success: 'check',
  error: 'bolt',
  info: 'info',
};

const toneInks: Record<KkNoticeTone, { light: string; dark: string }> = {
  success: { light: kkTokens.color.light.greenInk, dark: kkTokens.color.dark.greenInk },
  error: { light: kkTokens.color.light.redInk, dark: kkTokens.color.dark.redInk },
  info: { light: kkTokens.color.light.blueInk, dark: kkTokens.color.dark.blueInk },
};

export const noticeIconName = (tone: KkNoticeTone, icon: KkIconName | undefined): KkIconName =>
  icon ?? toneIcons[tone];

export const noticeInkScheme = (tone: KkNoticeTone): KkScheme =>
  schemeInk(toneInks[tone].light, toneInks[tone].dark);

export const noticeEdgeScheme = (tone: KkNoticeTone): KkScheme =>
  schemeEdge(
    alpha(toneInks[tone].light, hairline.light),
    alpha(toneInks[tone].dark, hairline.dark),
  );
