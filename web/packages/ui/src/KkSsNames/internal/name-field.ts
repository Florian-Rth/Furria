import type { CSSObject, Theme } from '@mui/material/styles';
import { kkTokens } from '../../tokens';

export const NAME_FIELD_ATTRIBUTE = 'data-kk-ss-name';
export const NAMES_ATTRIBUTE = 'data-kk-ss-names';
export const NAME_LIMIT = 80;
export const NUMBER_WIDTH = 3;
export const NAME_GAP = 1;

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export const nameFieldPaint = (theme: Theme): CSSObject => ({
  flex: '1 1 auto',
  minWidth: 0,
  minHeight: kkTokens.tapTarget,
  px: 1,
  typography: 'body2',
  fontWeight: 700,
  borderRadius: `${kkTokens.radius.bar}px`,
  boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
  '& input::placeholder': { color: palette(theme).text.secondary, opacity: 1 },
  '&.Mui-focused': {
    boxShadow: `inset 0 0 0 ${kkTokens.line.section}px ${palette(theme).text.primary}`,
  },
});

export const focusNextName = (input: HTMLInputElement): void => {
  const fields = [
    ...(input
      .closest(`[${NAMES_ATTRIBUTE}]`)
      ?.querySelectorAll<HTMLInputElement>(`input[${NAME_FIELD_ATTRIBUTE}]`) ?? []),
  ];
  const next = fields[fields.indexOf(input) + 1];

  if (next === undefined) {
    input.blur();
    return;
  }
  next.focus();
};
