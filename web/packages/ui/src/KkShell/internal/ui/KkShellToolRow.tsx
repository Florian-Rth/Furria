import Stack from '@mui/material/Stack';
import { AnimatePresence, motion } from 'motion/react';
import type { CSSProperties, FC, PropsWithChildren } from 'react';
import { KkChrome } from '../../../internal/KkChrome';
import { kkTokens } from '../../../tokens';
import { useKkShell } from '../logic/shell-context';
import { TOOL_ROW_OUT, TOOL_ROW_SWEEP, TOOL_ROW_TUCKED } from '../logic/tool-row-motion';

const { toolRowHeight } = kkTokens.shell;
const TOOL_ROW_PADDING_X = 1;
const TOOL_ROW_KEY = 'tools';

const TUCKING: CSSProperties = { overflow: 'hidden', flexShrink: 0 };

interface KkShellToolRowProps extends PropsWithChildren {
  open: boolean;
}

export const KkShellToolRow: FC<KkShellToolRowProps> = ({ open, children }) => {
  const { density } = useKkShell();

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.div
          key={TOOL_ROW_KEY}
          style={TUCKING}
          initial={TOOL_ROW_TUCKED}
          animate={TOOL_ROW_OUT}
          exit={TOOL_ROW_TUCKED}
          transition={TOOL_ROW_SWEEP}
        >
          <KkChrome
            density={density}
            sx={{ height: `${toolRowHeight}px`, justifyContent: 'center', px: TOOL_ROW_PADDING_X }}
          >
            <Stack
              direction="row"
              data-kk-shell-tool-row
              sx={{ alignItems: 'center', gap: 1, minWidth: 0, flexWrap: 'nowrap' }}
            >
              {children}
            </Stack>
          </KkChrome>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
