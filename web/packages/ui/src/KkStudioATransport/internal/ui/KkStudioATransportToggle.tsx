import ButtonBase from '@mui/material/ButtonBase';
import type { FC } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import type { KkStudioAGlyphName } from '../../../KkStudioAGlyph/KkStudioAGlyph';
import { KkStudioAGlyph } from '../../../KkStudioAGlyph/KkStudioAGlyph';
import { kkTokens } from '../../../tokens';

interface KkStudioATransportToggleProps {
  label: string;
  glyph: KkStudioAGlyphName;
  pressed: boolean;
  onClick: () => void;
}

export const KkStudioATransportToggle: FC<KkStudioATransportToggleProps> = ({
  label,
  glyph,
  pressed,
  onClick,
}) => (
  <ButtonBase
    aria-label={label}
    aria-pressed={pressed}
    onClick={onClick}
    sx={(theme) => {
      const palette = (theme.vars ?? theme).palette;
      return {
        width: '2.5rem',
        height: '2.5rem',
        flexShrink: 0,
        borderRadius: '50%',
        border: `${kkTokens.line.hair}px solid`,
        transition: 'background-color .18s, color .18s, border-color .18s',
        ...(pressed
          ? {
              borderColor: palette.text.primary,
              backgroundColor: palette.text.primary,
              color: palette.background.paper,
            }
          : { borderColor: palette.divider, color: palette.text.secondary }),
        ...focusRing(theme),
      };
    }}
  >
    <KkStudioAGlyph name={glyph} size="1.125rem" />
  </ButtonBase>
);
