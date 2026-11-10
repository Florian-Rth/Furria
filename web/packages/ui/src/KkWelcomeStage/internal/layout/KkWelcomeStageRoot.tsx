import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import type { FC, KeyboardEvent, PropsWithChildren } from 'react';
import { safeArea } from '../../../internal/safe-area';
import { KkConfettiRain } from '../../../KkConfettiRain';
import { stampJoltOf } from '../../../stamp-down';
import { useBeatReached } from '../logic/use-beat-reached';
import { WelcomeRunContext } from '../logic/welcome-run-context';
import { WelcomeCorners } from '../ui/WelcomeCorners';
import { fadeOut, KK_WELCOME_LEAVE_MS } from '../welcome-paint';

const CONTENT_WIDTH = '30rem';
const TOP_GAP = 14;
const BOTTOM_GAP = 28;
const SHEET_FADE_DELAY_MS = 260;
const ESCAPE = 'Escape';
const RAIN_COUNT = 36;

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
            ...stampJoltOf(joltAt),
          }}
        >
          {children}
        </Stack>
      </Box>
    </WelcomeRunContext.Provider>
  );
};
