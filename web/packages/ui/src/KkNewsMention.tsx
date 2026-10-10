import Link from '@mui/material/Link';
import Popover from '@mui/material/Popover';
import type { Theme } from '@mui/material/styles';
import type { FC, MouseEvent, ReactNode } from 'react';
import { useId, useState } from 'react';
import { focusRing } from './internal/focus-ring';
import type { KkGroupTone } from './internal/group-tone';
import { groupToneInkPaint } from './internal/group-tone';
import { kkTokens } from './tokens';

const MENTION_TINT = 'color-mix(in srgb, currentColor 12%, transparent)';

const PAPER_STYLE = {
  mt: 0.75,
  width: (theme: Theme) => theme.spacing(36),
  maxWidth: (theme: Theme) => `calc(100vw - ${theme.spacing(4)})`,
  borderRadius: `${kkTokens.radius.base}px`,
  boxShadow: kkTokens.shadow.raised,
} as const;

interface KkNewsMentionProps {
  label: string;
  tone: KkGroupTone | null;
  children: ReactNode;
}

export const KkNewsMention: FC<KkNewsMentionProps> = ({ label, tone, children }) => {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const cardId = useId();
  const isOpen = anchor !== null;

  const open = (event: MouseEvent<HTMLElement>): void => {
    setAnchor(event.currentTarget);
  };
  const close = (): void => {
    setAnchor(null);
  };

  return (
    <>
      <Link
        component="button"
        type="button"
        variant="inherit"
        underline="none"
        data-kk-news-mention
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={isOpen ? cardId : undefined}
        onClick={open}
        sx={(theme) => ({
          verticalAlign: 'baseline',
          display: 'inline',
          color: 'inherit',
          fontWeight: 700,
          'strong > &': { fontWeight: 800 },
          paddingInline: '0.2em',
          borderRadius: theme.spacing(0.5),
          backgroundColor: MENTION_TINT,
          boxDecorationBreak: 'clone',
          WebkitBoxDecorationBreak: 'clone',
          textDecoration: 'underline dotted',
          textDecorationThickness: kkTokens.line.hair,
          textUnderlineOffset: '0.2em',
          ...(tone === null ? {} : groupToneInkPaint(theme, tone)),
          '@media (hover: hover)': {
            '&:hover': { textDecorationStyle: 'solid' },
          },
          ...focusRing(theme),
        })}
      >
        {label}
      </Link>
      <Popover
        id={cardId}
        open={isOpen}
        anchorEl={anchor}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        slotProps={{ paper: { role: 'dialog', 'aria-label': label, sx: PAPER_STYLE } }}
      >
        {children}
      </Popover>
    </>
  );
};
