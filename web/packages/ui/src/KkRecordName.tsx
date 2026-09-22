import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from './internal/focus-ring';
import { labelSignifier, signifierCommitted } from './internal/label-signifier';
import { redInk } from './internal/red-ink';
import { kkTokens } from './tokens';

type KkRecordNameSize = 'medium' | 'small';

const FOCUS_OFFSET = 2;

const sizeFonts: Record<KkRecordNameSize, string> = {
  medium: '1.0625rem',
  small: kkTokens.type.span,
};

const buttonPaint = (theme: Theme): CSSObject => ({
  appearance: 'none',
  m: 0,
  p: 0,
  borderWidth: 0,
  borderStyle: 'solid',
  backgroundColor: 'transparent',
  textAlign: 'left',
  cursor: 'pointer',
  outlineOffset: FOCUS_OFFSET,
  ...focusRing(theme),
  ...labelSignifier,
  '&:hover, &:focus-visible': { ...signifierCommitted, ...redInk(theme) },
});

interface KkRecordNameProps {
  name: string;
  size?: KkRecordNameSize;
  selected?: boolean;
  dimmed?: boolean;
  onSelect?: () => void;
}

export const KkRecordName: FC<KkRecordNameProps> = ({
  name,
  size = 'medium',
  selected = false,
  dimmed = false,
  onSelect,
}) => {
  const interactive = onSelect !== undefined;
  const component = interactive ? 'button' : 'p';
  const nativeProps = interactive ? { type: 'button' as const } : {};
  const current = selected ? true : undefined;
  const color = dimmed ? 'text.secondary' : 'text.primary';

  return (
    <Typography
      component={component}
      {...nativeProps}
      aria-current={current}
      onClick={onSelect}
      data-kk-record-name
      sx={(theme) => ({
        minWidth: 0,
        fontFamily: kkTokens.font.display,
        fontWeight: kkTokens.font.displayWeight,
        fontSize: sizeFonts[size],
        letterSpacing: kkTokens.type.tracking.display,
        lineHeight: 1.25,
        color,
        ...(interactive ? buttonPaint(theme) : {}),
      })}
    >
      {name}
    </Typography>
  );
};
