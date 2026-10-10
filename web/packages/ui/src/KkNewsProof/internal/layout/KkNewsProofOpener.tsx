import ButtonBase from '@mui/material/ButtonBase';
import type { FC, PropsWithChildren } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

interface KkNewsProofOpenerProps extends PropsWithChildren {
  label: string;
  onOpen: () => void;
}

export const KkNewsProofOpener: FC<KkNewsProofOpenerProps> = ({ label, onOpen, children }) => (
  <ButtonBase
    aria-label={label}
    onClick={onOpen}
    data-kk-news-proof-opener
    sx={(theme) => ({
      display: 'block',
      width: '100%',
      minWidth: 0,
      textAlign: 'inherit',
      borderRadius: `${kkTokens.radius.base}px`,
      cursor: 'zoom-in',
      '@media (hover: hover)': {
        '&:hover': {
          outline: `${kkTokens.line.hair}px solid`,
          outlineColor: (theme.vars ?? theme).palette.divider,
          outlineOffset: 4,
        },
      },
      ...focusRing(theme),
    })}
  >
    {children}
  </ButtonBase>
);
