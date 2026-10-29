import Box from '@mui/material/Box';
import type { FC, PointerEvent, PropsWithChildren } from 'react';
import { kkTokens } from '../../../tokens';

const PERCENT = 100;

export interface KkStudioDPlayerMark {
  key: string;
  at: number;
  opensPart: boolean;
}

export interface KkStudioDPlayerShare {
  start: number;
  end: number;
}

interface KkStudioDPlayerProgressProps extends PropsWithChildren {
  label: string;
  marks: readonly KkStudioDPlayerMark[];
  loop: KkStudioDPlayerShare | null;
  onSeek: (share: number) => void;
}

const shareAt = (event: PointerEvent<HTMLElement>): number => {
  const box = event.currentTarget.getBoundingClientRect();
  return box.width <= 0 ? 0 : Math.min(Math.max((event.clientX - box.left) / box.width, 0), 1);
};

export const KkStudioDPlayerProgress: FC<KkStudioDPlayerProgressProps> = ({
  label,
  marks,
  loop,
  onSeek,
  children,
}) => {
  const seek = (event: PointerEvent<HTMLElement>): void => {
    onSeek(shareAt(event));
  };

  const ticks = marks.map((mark) => (
    <Box
      key={mark.key}
      aria-hidden
      sx={(theme) => ({
        position: 'absolute',
        left: `${mark.at * PERCENT}%`,
        top: '50%',
        width: '2px',
        height: mark.opensPart ? '0.75rem' : '3px',
        transform: 'translate(-50%, -50%)',
        borderRadius: '1px',
        backgroundColor: mark.opensPart
          ? (theme.vars ?? theme).palette.text.secondary
          : kkTokens.color.dark.darkroom,
        zIndex: 2,
      })}
    />
  ));
  const band =
    loop === null ? null : (
      <Box
        aria-hidden
        data-kk-studio-d-loop
        sx={(theme) => ({
          position: 'absolute',
          left: `${loop.start * PERCENT}%`,
          width: `${(loop.end - loop.start) * PERCENT}%`,
          top: '50%',
          height: '0.5rem',
          transform: 'translateY(-50%)',
          borderRadius: `${kkTokens.radius.bar}px`,
          backgroundColor: `color-mix(in srgb, ${(theme.vars ?? theme).palette.primary.main} 38%, transparent)`,
          zIndex: 0,
        })}
      />
    );

  return (
    <Box
      role="button"
      aria-label={label}
      tabIndex={-1}
      onPointerDown={seek}
      data-kk-studio-d-progress
      sx={{
        position: 'relative',
        height: '1.5rem',
        cursor: 'pointer',
        touchAction: 'none',
        containerType: 'inline-size',
      }}
    >
      <Box
        aria-hidden
        sx={(theme) => ({
          position: 'absolute',
          left: 0,
          right: 0,
          top: '50%',
          height: '3px',
          transform: 'translateY(-50%)',
          borderRadius: `${kkTokens.radius.bar}px`,
          backgroundColor: `color-mix(in srgb, ${(theme.vars ?? theme).palette.text.primary} 26%, transparent)`,
        })}
      />
      {band}
      {children}
      {ticks}
    </Box>
  );
};
