import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { FC } from 'react';
import { focusRing } from '../internal/focus-ring';
import { kkTokens } from '../tokens';

const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)';
const NARROW_SIDE = '@container kk-practice (min-aspect-ratio: 5/4) and (max-width: 60rem)';

const palette = (theme: Theme) => (theme.vars ?? theme).palette;

const editPaint =
  (editing: boolean) =>
  (theme: Theme): CSSObject => ({
    flexShrink: 0,
    height: kkTokens.tapTarget,
    minWidth: kkTokens.tapTarget,
    px: editing ? 1.75 : 0,
    gap: 0.5,
    borderRadius: `${kkTokens.radius.pill}px`,
    color: editing ? palette(theme).primary.contrastText : palette(theme).text.primary,
    backgroundColor: editing ? palette(theme).text.primary : 'transparent',
    transition: `padding 320ms ${EASE}, background-color 240ms ease-out, color 240ms ease-out, transform 120ms ease-out`,
    '&:active': { transform: 'scale(0.94)' },
    [NARROW_SIDE]: { px: 0, '& [data-kk-studio-h-done]': { display: 'none' } },
    ...focusRing(theme),
  });

interface KkStudioHEditProps {
  editing: boolean;
  editLabel: string;
  doneText: string;
  onToggle: () => void;
}

export const KkStudioHEdit: FC<KkStudioHEditProps> = ({
  editing,
  editLabel,
  doneText,
  onToggle,
}) => {
  const glyph = editing ? (
    <CheckRoundedIcon fontSize="small" />
  ) : (
    <EditRoundedIcon fontSize="small" />
  );
  const label = editing ? doneText : editLabel;
  const text = editing ? (
    <Typography
      component="span"
      variant="subtitle2"
      data-kk-studio-h-done
      sx={{ fontWeight: 900, lineHeight: 1, whiteSpace: 'nowrap', color: 'inherit' }}
    >
      {doneText}
    </Typography>
  ) : null;

  return (
    <ButtonBase
      aria-label={label}
      aria-pressed={editing}
      onClick={onToggle}
      data-kk-studio-h-edit={editing}
      sx={editPaint(editing)}
    >
      <Box sx={{ display: 'grid', placeItems: 'center' }}>{glyph}</Box>
      {text}
    </ButtonBase>
  );
};
