import VideoLibraryRoundedIcon from '@mui/icons-material/VideoLibraryRounded';
import ButtonBase from '@mui/material/ButtonBase';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC } from 'react';
import { glassOf, keepGesture, pillKeyPaint } from '../video-key-paint';

const takePaint = (theme: Theme): CSSObject => ({
  ...pillKeyPaint(theme),
  fontVariantNumeric: 'tabular-nums',
  backgroundColor: glassOf(58),
});

interface KkVideoTakeProps {
  text: string;
  label: string;
  onNext: () => void;
}

export const KkVideoTake: FC<KkVideoTakeProps> = ({ text, label, onNext }) => (
  <ButtonBase
    aria-label={label}
    onClick={onNext}
    onPointerDown={keepGesture}
    onPointerUp={keepGesture}
    data-kk-video-take
    sx={takePaint}
  >
    <VideoLibraryRoundedIcon fontSize="small" />
    {text}
  </ButtonBase>
);
