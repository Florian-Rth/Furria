import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import InputBase from '@mui/material/InputBase';
import Stack from '@mui/material/Stack';
import type { Theme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ChangeEvent, FC } from 'react';
import { focusRing } from '../../internal/focus-ring';
import type { KkFrameMark } from '../../KkFrame';
import { KkFrame } from '../../KkFrame';
import { KkIcon } from '../../KkIcon';
import { KkIconButton } from '../../KkIconButton';
import { kkTokens } from '../../tokens';
import type { KkShowcaseHandle } from './use-showcase-drag';

const { showcase } = kkTokens.gallery;
const CAPTION_MIN_ROWS = 2;
const CAPTION_MAX_ROWS = 3;
const DRAGGED_OPACITY = 0.55;
const SETTLE_EASE = 'cubic-bezier(0.2, 0.9, 0.3, 1.25)';

export interface KkShowcasePieceData {
  id: string;
  label: string;
  source: string;
  badge?: string;
  caption: string;
  captionPlaceholder: string;
  captionLabel: string;
  handleLabel: string;
  removeLabel: string;
}

interface KkShowcasePieceProps {
  piece: KkShowcasePieceData;
  position: number;
  slotAttribute: string;
  isDragging: boolean;
  handle: KkShowcaseHandle;
  captionMaxLength: number;
  onCaption: (id: string, caption: string) => void;
  onRemove: (id: string) => void;
}

export const KkShowcasePiece: FC<KkShowcasePieceProps> = ({
  piece,
  position,
  slotAttribute,
  isDragging,
  handle,
  captionMaxLength,
  onCaption,
  onRemove,
}) => {
  const slotMarker = { [slotAttribute]: position - 1 };
  const mark: KkFrameMark = { kind: 'selection', order: position };
  const changeCaption = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
    onCaption(piece.id, event.target.value);
  };
  const remove = (): void => onRemove(piece.id);
  const badge =
    piece.badge === undefined ? null : (
      <Typography
        component="span"
        variant="overline"
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          px: 0.75,
          color: 'warning.contrastText',
          bgcolor: 'warning.main',
          fontFamily: kkTokens.font.display,
          letterSpacing: kkTokens.type.tracking.display,
          lineHeight: 1.6,
        }}
      >
        {piece.badge}
      </Typography>
    );

  return (
    <Stack
      role="listitem"
      {...slotMarker}
      sx={{
        rowGap: 0.75,
        minWidth: 0,
        opacity: isDragging ? DRAGGED_OPACITY : 1,
        transform: isDragging ? 'scale(0.96) rotate(-1.2deg)' : 'none',
        transition: `transform ${showcase.settleSeconds}s ${SETTLE_EASE}, opacity ${showcase.settleSeconds / 2}s ease-out`,
        '@media (prefers-reduced-motion: reduce)': { transform: 'none', transition: 'none' },
      }}
    >
      <Box sx={{ position: 'relative' }}>
        <KkFrame label={piece.label} source={piece.source} mark={mark} />
        {badge}
      </Box>
      <InputBase
        value={piece.caption}
        onChange={changeCaption}
        placeholder={piece.captionPlaceholder}
        multiline
        minRows={CAPTION_MIN_ROWS}
        maxRows={CAPTION_MAX_ROWS}
        inputProps={{ maxLength: captionMaxLength, 'aria-label': piece.captionLabel }}
        sx={{
          typography: 'caption',
          color: 'text.primary',
          px: 0.75,
          py: 0.5,
          borderBottom: `${kkTokens.line.hair}px dashed`,
          borderColor: 'warning.main',
          '& textarea::placeholder': { fontStyle: 'italic', opacity: DRAGGED_OPACITY },
        }}
      />
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
        <ButtonBase
          aria-label={piece.handleLabel}
          onPointerDown={handle.onPointerDown}
          onPointerMove={handle.onPointerMove}
          onPointerUp={handle.onPointerUp}
          onPointerCancel={handle.onPointerCancel}
          onKeyDown={handle.onKeyDown}
          sx={(theme: Theme) => ({
            touchAction: 'none',
            cursor: isDragging ? 'grabbing' : 'grab',
            color: 'warning.main',
            p: 0.5,
            borderRadius: `${kkTokens.radius.bar}px`,
            ...focusRing(theme),
          })}
        >
          <KkIcon name="drag" size="small" />
        </ButtonBase>
        <KkIconButton label={piece.removeLabel} icon="close" size="small" onClick={remove} />
      </Stack>
    </Stack>
  );
};
