import ButtonBase from '@mui/material/ButtonBase';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { redInk } from '../../../internal/red-ink';
import { KkStudioAGlyph } from '../../../KkStudioAGlyph/KkStudioAGlyph';
import { kkTokens } from '../../../tokens';

interface KkStudioATransportLoopProps {
  label: string;
  name?: string;
  pressed: boolean;
  disabled: boolean;
  grow?: boolean;
  glyph?: boolean;
  onClick: () => void;
}

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

export const KkStudioATransportLoop: FC<KkStudioATransportLoopProps> = ({
  label,
  name,
  pressed,
  disabled,
  grow = false,
  glyph = true,
  onClick,
}) => {
  const loopGlyph = glyph ? <KkStudioAGlyph name="loop" size="1.0625rem" /> : null;

  return (
    <ButtonBase
      aria-label={name}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      data-kk-studio-a-loop-button={pressed ? 'on' : 'off'}
      sx={(theme) => ({
        flex: grow ? 1 : '0 0 auto',
        minWidth: 0,
        height: '2.75rem',
        gap: 0.75,
        px: 1.5,
        borderRadius: `${kkTokens.radius.pill}px`,
        border: `${kkTokens.line.hair}px solid`,
        transition: 'background-color .18s, color .18s, border-color .18s',
        ...(pressed
          ? {
              borderColor: palette(theme).primary.main,
              backgroundColor: `color-mix(in srgb, ${palette(theme).primary.main} 14%, transparent)`,
              ...redInk(theme),
            }
          : { borderColor: palette(theme).divider, color: palette(theme).text.primary }),
        '&.Mui-disabled': { color: palette(theme).text.disabled },
        ...focusRing(theme),
      })}
    >
      {loopGlyph}
      <Typography
        component="span"
        variant="body2"
        sx={{
          fontWeight: 800,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          minWidth: 0,
        }}
      >
        {label}
      </Typography>
    </ButtonBase>
  );
};
