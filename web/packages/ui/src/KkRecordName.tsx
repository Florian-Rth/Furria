import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ElementType, FC } from 'react';
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

const interactivePaint = (theme: Theme): CSSObject => ({
  appearance: 'none',
  m: 0,
  p: 0,
  borderWidth: 0,
  borderStyle: 'solid',
  backgroundColor: 'transparent',
  textAlign: 'left',
  textDecoration: 'none',
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
  component?: ElementType;
  to?: string;
  params?: Record<string, string>;
  onSelect?: () => void;
}

export const KkRecordName: FC<KkRecordNameProps> = ({
  name,
  size = 'medium',
  selected = false,
  dimmed = false,
  component,
  to,
  params,
  onSelect,
}) => {
  const linked = component !== undefined;
  const interactive = linked || onSelect !== undefined;
  const element = component ?? (onSelect === undefined ? 'p' : 'button');
  const routeProps = linked ? { to, params } : {};
  const nativeProps = element === 'button' ? { type: 'button' as const } : {};
  const current = selected ? true : undefined;
  const color = dimmed ? 'text.secondary' : 'text.primary';

  return (
    <Typography
      component={element}
      {...routeProps}
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
        ...(interactive ? interactivePaint(theme) : {}),
      })}
    >
      {name}
    </Typography>
  );
};
