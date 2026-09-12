import Modal from '@mui/material/Modal';
import Stack from '@mui/material/Stack';
import type { FC, PropsWithChildren } from 'react';
import { KK_DARK_SCHEME_ATTRIBUTE } from '../../../theme';
import { kkTokens } from '../../../tokens';
import { useIsMobile } from '../../../use-is-mobile';
import { useAppShellCurtain } from '../logic/app-shell-curtain-context';
import { KkAppShellGlow } from '../ui/KkAppShellGlow';
import { KkAppShellCurtainTransition } from './KkAppShellCurtainTransition';

const GLOW = { width: 460, height: 400, top: -80 } as const;
const PANEL_LABEL = 'Navigation';

const darkSchemeAttribute = { [KK_DARK_SCHEME_ATTRIBUTE]: '' };

export const KkAppShellCurtain: FC<PropsWithChildren> = ({ children }) => {
  const curtain = useAppShellCurtain();
  const isMobile = useIsMobile();
  const isOpen = curtain.isOpen && isMobile;

  return (
    <Modal open={isOpen} onClose={curtain.close} hideBackdrop closeAfterTransition>
      <KkAppShellCurtainTransition in={isOpen}>
        <Stack
          role="dialog"
          aria-modal
          aria-label={PANEL_LABEL}
          {...darkSchemeAttribute}
          data-kk-app-shell-curtain
          sx={(theme) => ({
            position: 'relative',
            isolation: 'isolate',
            overflow: 'hidden',
            height: '100%',
            backgroundColor: kkTokens.chrome.light.sideBg,
            ...theme.applyStyles('dark', { backgroundColor: kkTokens.chrome.dark.sideBg }),
            color: 'text.primary',
            px: 2.75,
            pt: 6.25,
            pb: 2.75,
            gap: 2,
          })}
        >
          <KkAppShellGlow tone="gold" {...GLOW} centred />
          {children}
        </Stack>
      </KkAppShellCurtainTransition>
    </Modal>
  );
};
