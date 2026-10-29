import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { CSSObject, Theme } from '@mui/material/styles';
import type { FC, PropsWithChildren, ReactNode } from 'react';
import { kkTokens } from '../tokens';
import { useStudioFSwipe } from './internal/logic/use-studio-f-swipe';
import type { KkStudioFTurn } from './studio-f-types';

export type KkStudioFFrameTone = 'film' | 'paper';

const framePaint =
  (tone: KkStudioFFrameTone) =>
  (theme: Theme): CSSObject => {
    const palette = (theme.vars ?? theme).palette;

    return {
      position: 'absolute',
      inset: 0,
      borderRadius: `${kkTokens.radius.base}px`,
      overflow: 'clip',
      touchAction: 'none',
      userSelect: 'none',
      backgroundColor: tone === 'film' ? kkTokens.color.dark.darkroom : palette.background.paper,
      borderStyle: 'solid',
      borderWidth: kkTokens.line.hair,
      borderColor: tone === 'film' ? 'transparent' : palette.divider,
      transition: 'background-color 240ms ease-out, border-color 240ms ease-out',
      isolation: 'isolate',
    };
  };

interface KkStudioFFrameProps extends PropsWithChildren {
  label: string;
  tone: KkStudioFFrameTone;
  turn: KkStudioFTurn;
  canPrevious: boolean;
  canNext: boolean;
  onPrevious: () => void;
  onNext: () => void;
  overlay: ReactNode;
}

export const KkStudioFFrame: FC<KkStudioFFrameProps> = ({
  label,
  tone,
  turn,
  canPrevious,
  canNext,
  onPrevious,
  onNext,
  overlay,
  children,
}) => {
  const swipe = useStudioFSwipe({ turn, canPrevious, canNext, onPrevious, onNext });

  return (
    <Box
      role="group"
      aria-label={label}
      data-kk-studio-f-frame={tone}
      {...swipe.handlers}
      sx={framePaint(tone)}
    >
      <Box
        ref={swipe.contentRef}
        data-kk-studio-f-content
        sx={(theme) => ({
          position: 'absolute',
          inset: 0,
          top: tone === 'paper' ? `calc(${theme.spacing(1.5)} + ${kkTokens.tapTarget})` : 0,
          willChange: 'transform',
        })}
      >
        {children}
      </Box>
      <Stack
        direction="row"
        data-kk-studio-f-overlay
        sx={(theme) => ({
          position: 'absolute',
          top: theme.spacing(1),
          left: theme.spacing(1),
          right: theme.spacing(1),
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: 1,
          pointerEvents: 'none',
          '& > *': { pointerEvents: 'auto' },
        })}
      >
        {overlay}
      </Stack>
    </Box>
  );
};
