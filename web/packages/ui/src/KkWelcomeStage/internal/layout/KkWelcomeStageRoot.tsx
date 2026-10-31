import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { keyframes } from '@mui/material/styles';
import type { FC, KeyboardEvent, PropsWithChildren } from 'react';
import { safeArea } from '../../../internal/safe-area';
import { KkConfettiRain } from '../../../KkConfettiRain';
import { useBeatReached } from '../logic/use-beat-reached';
import { WelcomeRunContext } from '../logic/welcome-run-context';
import { WelcomeCorners } from '../ui/WelcomeCorners';
import { fadeOut, KK_WELCOME_LEAVE_MS, REDUCED_MOTION } from '../welcome-paint';

const CONTENT_WIDTH = '30rem';
const TOP_GAP = 14;
const BOTTOM_GAP = 28;
const JOLT_MS = 280;
const SHEET_FADE_DELAY_MS = 260;
const ESCAPE = 'Escape';
const RAIN_COUNT = 36;

const jolt = keyframes`
  0% {
    transform: none;
  }
  25% {
    transform: translate(0, 7px) rotate(-0.4deg);
  }
  55% {
    transform: translate(0, -4px) rotate(0.3deg);
  }
  80% {
    transform: translate(0, 2px);
  }
  100% {
    transform: none;
  }
`;

interface KkWelcomeStageRootProps extends PropsWithChildren {
  label: string;
  leaving: boolean;
  joltAt: number;
  onSkip: () => void;
}

export const KkWelcomeStageRoot: FC<KkWelcomeStageRootProps> = ({
  label,
  leaving,
  joltAt,
  onSkip,
  children,
}) => {
  const run = { leaving };
  const answered = useBeatReached(joltAt);
  const rain = answered ? <KkConfettiRain count={RAIN_COUNT} /> : null;

  const skipOnEscape = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === ESCAPE) {
      onSkip();
    }
  };

  return (
    <WelcomeRunContext.Provider value={run}>
      <Box
        role="dialog"
        aria-modal
        aria-label={label}
        onKeyDown={skipOnEscape}
        sx={(theme) => ({
          position: 'fixed',
          inset: 0,
          zIndex: theme.zIndex.modal + 1,
          isolation: 'isolate',
          overflow: 'clip',
          overscrollBehavior: 'none',
          bgcolor: 'background.default',
          color: 'text.primary',
          animation: leaving
            ? `${fadeOut} ${KK_WELCOME_LEAVE_MS - SHEET_FADE_DELAY_MS}ms ease-in ${SHEET_FADE_DELAY_MS}ms both`
            : 'none',
          pointerEvents: leaving ? 'none' : 'auto',
        })}
      >
        <WelcomeCorners />
        {rain}
        <Stack
          sx={{
            position: 'relative',
            height: '100dvh',
            width: '100%',
            maxWidth: CONTENT_WIDTH,
            mx: 'auto',
            px: 3,
            pt: safeArea('top', TOP_GAP),
            pb: safeArea('bottom', BOTTOM_GAP),
            rowGap: 3,
            justifyContent: 'space-between',
            animation: `${jolt} ${JOLT_MS}ms ease-out ${joltAt}ms both`,
            [REDUCED_MOTION]: { animation: 'none' },
          }}
        >
          {children}
        </Stack>
      </Box>
    </WelcomeRunContext.Provider>
  );
};
