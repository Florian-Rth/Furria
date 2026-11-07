import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { redInk } from '../../../internal/red-ink';
import type { KkLaneGlyphName } from '../../../KkLaneGlyph';
import { KkLaneGlyph } from '../../../KkLaneGlyph';

export type KkEditorHeadStatusTone = 'quiet' | 'danger';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

interface KkEditorHeadStatusProps {
  text: string;
  label: string;
  glyph: KkLaneGlyphName;
  tone: KkEditorHeadStatusTone;
  textShown?: boolean;
}

export const KkEditorHeadStatus: FC<KkEditorHeadStatusProps> = ({
  text,
  label,
  glyph,
  tone,
  textShown = true,
}) => {
  const shownText = textShown ? (
    <Typography
      component="span"
      variant="caption"
      noWrap
      sx={{ fontWeight: 700, lineHeight: 1.2, color: 'inherit', minWidth: 0 }}
    >
      {text}
    </Typography>
  ) : null;

  return (
    <Stack
      direction="row"
      role="status"
      aria-label={label}
      data-kk-editor-head-status={tone}
      sx={(theme) => ({
        flexShrink: 0,
        alignItems: 'center',
        gap: 0.25,
        minWidth: 0,
        color: palette(theme).text.secondary,
        '&[data-kk-editor-head-status="danger"]': redInk(theme),
      })}
    >
      <KkLaneGlyph name={glyph} />
      {shownText}
    </Stack>
  );
};
