import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PointerEvent } from 'react';
import { focusRing } from '../../../internal/focus-ring';
import { kkTokens } from '../../../tokens';

const takePaint = (theme: Theme): CSSObject => ({
  gap: theme.spacing(0.5),
  height: kkTokens.tapTarget,
  paddingInline: theme.spacing(1.25),
  borderRadius: `${kkTokens.radius.pill}px`,
  ...theme.typography.caption,
  fontWeight: 800,
  fontVariantNumeric: 'tabular-nums',
  color: kkTokens.overlay.onPhotoText,
  backgroundColor: `color-mix(in srgb, ${kkTokens.overlay.scrimInk} 58%, transparent)`,
  backdropFilter: `blur(${kkTokens.glass.blur})`,
  transition: kkTokens.motion.press,
  '&:active': { transform: 'scale(0.95)' },
  ...focusRing(theme),
});

const keepGesture = (event: PointerEvent<HTMLButtonElement>): void => {
  event.stopPropagation();
};

interface KkPracticeScreenTakeProps {
  text: string;
  label: string;
  onNext: () => void;
}

export const KkPracticeScreenTake: FC<KkPracticeScreenTakeProps> = ({ text, label, onNext }) => (
  <ButtonBase
    aria-label={label}
    onClick={onNext}
    onPointerDown={keepGesture}
    onPointerUp={keepGesture}
    data-kk-practice-take
    sx={takePaint}
  >
    <VideoLibraryRoundedIcon fontSize="small" />
    {text}
  </ButtonBase>
);
