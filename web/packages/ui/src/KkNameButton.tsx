import ButtonBase from '@mui/material/ButtonBase';
import type { FC } from 'react';
import { focusRing } from './internal/focus-ring';
import { kkTokens } from './tokens';

const UNDERLINE_OFFSET = '0.18em';

interface KkNameButtonProps {
  name: string;
  label: string;
  onSelect: () => void;
}

export const KkNameButton: FC<KkNameButtonProps> = ({ name, label, onSelect }) => (
  <ButtonBase
    component="span"
    onClick={onSelect}
    aria-label={label}
    data-kk-name-button
    sx={(theme) => ({
      display: 'inline',
      verticalAlign: 'baseline',
      color: 'inherit',
      textDecorationLine: 'underline',
      textDecorationStyle: 'dotted',
      textDecorationThickness: kkTokens.line.section,
      textUnderlineOffset: UNDERLINE_OFFSET,
      borderRadius: `${kkTokens.radius.bar}px`,
      ...focusRing(theme),
      '@media (hover: hover)': {
        '&:hover': { textDecorationStyle: 'solid' },
      },
    })}
  >
    {name}
  </ButtonBase>
);
