import ButtonBase from '@mui/material/ButtonBase';
import Popover from '@mui/material/Popover';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC, PropsWithChildren } from 'react';
import { useState } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { tonePaint } from '../../../internal/tone';
import type { KkFocusGlyphName } from '../../../KkFocusGlyph';
import { KkFocusGlyph } from '../../../KkFocusGlyph';
import { kkTokens } from '../../../tokens';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export type KkFocusPopTone = 'plain' | 'accent';

interface KkFocusPopRootProps extends PropsWithChildren {
  glyph: KkFocusGlyphName;
  text: string;
  label: string;
  title: string;
  tone: KkFocusPopTone;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const KkFocusPopRoot: FC<KkFocusPopRootProps> = ({
  glyph,
  text,
  label,
  title,
  tone,
  open,
  onOpen,
  onClose,
  children,
}) => {
  const [anchor, setAnchor] = useState<HTMLButtonElement | null>(null);

  return (
    <>
      <ButtonBase
        ref={setAnchor}
        aria-label={label}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={onOpen}
        data-tone={tone}
        sx={(theme) => ({
          flex: 'none',
          gap: 0.5,
          minHeight: kkTokens.tapTarget,
          px: 1.25,
          borderRadius: `${kkTokens.radius.chip}px`,
          boxShadow: `inset 0 0 0 ${kkTokens.line.hair}px ${palette(theme).divider}`,
          color: palette(theme).text.primary,
          '&[data-tone="accent"]': tonePaint(theme, 'accent'),
          ...focusRing(theme),
        })}
      >
        <KkFocusGlyph name={glyph} />
        <Typography
          component="span"
          variant="caption"
          sx={{ fontWeight: 800, whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
        >
          {text}
        </Typography>
      </ButtonBase>
      <Popover
        open={open && anchor !== null}
        anchorEl={anchor}
        onClose={onClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            role: 'dialog',
            'aria-label': title,
            sx: {
              mt: 0.5,
              width: 'min(22rem, calc(100vw - 2rem))',
              maxHeight: '70vh',
              borderRadius: `${kkTokens.radius.base}px`,
              boxShadow: kkTokens.shadow.raised,
            },
          },
        }}
      >
        <Stack sx={{ p: 1, gap: 0.25 }}>
          <Typography
            variant="overline"
            sx={{
              px: 1,
              pt: 0.5,
              fontWeight: kkTokens.eyebrow.fontWeight,
              letterSpacing: kkTokens.eyebrow.letterSpacing,
              color: 'text.secondary',
            }}
          >
            {title}
          </Typography>
          {children}
        </Stack>
      </Popover>
    </>
  );
};
